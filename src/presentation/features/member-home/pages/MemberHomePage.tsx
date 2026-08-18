import { useState, type FormEvent } from "react";
import type { Member } from "@domain/member/entities/Member";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import { PageLoader } from "@presentation/shared/components/PageLoader";
import { FormModal } from "@presentation/shared/components/FormModal";
import { MetricCard } from "@presentation/shared/components/MetricCard";
import { getTrendIndicator } from "@presentation/shared/utils/bioimpedanceTrend";
import { formatCurrency, formatLocalDate } from "@presentation/shared/utils/formatters";

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300";

export interface RegisterBioimpedanceData {
  date: Date;
  weight: number;
  height?: number;
  imc?: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  kcal?: number;
  metabolicAge?: number;
  visceralFatPercentage?: number;
  notes?: string;
}

interface MemberHomePageProps {
  member: Member | null;
  bioimpedances: Bioimpedance[];
  paymentStatus: PaymentStatusResult | null;
  membershipPlan: MembershipPlan | null;
  loading: boolean;
  error?: string;
  onRegisterBioimpedance: (data: RegisterBioimpedanceData) => Promise<void>;
}

interface FormFields {
  date: string;
  weight: string;
  height: string;
  imc: string;
  bodyFatPercentage: string;
  muscleMassPercentage: string;
  kcal: string;
  metabolicAge: string;
  visceralFatPercentage: string;
  notes: string;
}

const emptyForm = (): FormFields => ({
  date: new Date().toISOString().split("T")[0],
  weight: "",
  height: "",
  imc: "",
  bodyFatPercentage: "",
  muscleMassPercentage: "",
  kcal: "",
  metabolicAge: "",
  visceralFatPercentage: "",
  notes: "",
});

function parseOptionalFloat(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function MemberHomePage({
  member,
  bioimpedances,
  paymentStatus,
  membershipPlan,
  loading,
  error,
  onRegisterBioimpedance,
}: MemberHomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormFields>(emptyForm());
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field: keyof FormFields, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const weightValue = parseFloat(form.weight);
    if (Number.isNaN(weightValue) || weightValue <= 0) {
      setFormError("Ingresá un peso válido.");
      return;
    }

    setIsSaving(true);
    try {
      await onRegisterBioimpedance({
        date: new Date(form.date),
        weight: weightValue,
        height: parseOptionalFloat(form.height),
        imc: parseOptionalFloat(form.imc),
        bodyFatPercentage: parseOptionalFloat(form.bodyFatPercentage),
        muscleMassPercentage: parseOptionalFloat(form.muscleMassPercentage),
        kcal: parseOptionalFloat(form.kcal),
        metabolicAge: parseOptionalFloat(form.metabolicAge),
        visceralFatPercentage: parseOptionalFloat(form.visceralFatPercentage),
        notes: form.notes || undefined,
      });
      setIsModalOpen(false);
      setForm(emptyForm());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !member) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-600">{error || "No pudimos cargar tu ficha."}</p>
      </div>
    );
  }

  const sortedBio = [...bioimpedances].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = sortedBio[0];
  const previous = sortedBio[1];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hola, {member.name.split(" ")[0]}</h2>
          {member.trainingGroup && <p className="text-gray-600 mt-1">Grupo {member.trainingGroup}</p>}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300"
        >
          Registrar medición
        </button>
      </div>

      {membershipPlan && paymentStatus && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Estado de cuenta</h3>
          {paymentStatus.isOverdue ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">Mora: {formatCurrency(paymentStatus.totalDebt)}</p>
              {paymentStatus.overdueMonths.length > 0 && (
                <p className="text-red-600 text-xs mt-1">Meses adeudados: {paymentStatus.overdueMonths.join(", ")}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-semibold">Estás al día</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Últimos valores</h3>
          {latest?.status === "pending" && (
            <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
              Pendiente de confirmación
            </span>
          )}
        </div>

        {latest ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {formatLocalDate(latest.date, { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                label="Estatura"
                value={latest.height}
                previousValue={previous?.height ?? null}
                unit="cm"
                trend={getTrendIndicator(latest.height, previous?.height ?? null)}
              />
              <MetricCard
                label="Peso"
                value={latest.weight}
                previousValue={previous?.weight ?? null}
                unit="kg"
                trend={getTrendIndicator(latest.weight, previous?.weight ?? null)}
              />
              <MetricCard
                label="IMC"
                value={latest.imc}
                previousValue={previous?.imc ?? null}
                unit=""
                trend={getTrendIndicator(latest.imc, previous?.imc ?? null)}
              />
              <MetricCard
                label="% Grasa"
                value={latest.bodyFatPercentage}
                previousValue={previous?.bodyFatPercentage ?? null}
                unit="%"
                trend={getTrendIndicator(latest.bodyFatPercentage, previous?.bodyFatPercentage ?? null)}
              />
              <MetricCard
                label="% Músculo"
                value={latest.muscleMassPercentage}
                previousValue={previous?.muscleMassPercentage ?? null}
                unit="%"
                trend={getTrendIndicator(latest.muscleMassPercentage, previous?.muscleMassPercentage ?? null)}
              />
              <MetricCard
                label="KCAL"
                value={latest.kcal}
                previousValue={previous?.kcal ?? null}
                unit=""
                trend={getTrendIndicator(latest.kcal, previous?.kcal ?? null)}
              />
              <MetricCard
                label="Edad Metabólica"
                value={latest.metabolicAge}
                previousValue={previous?.metabolicAge ?? null}
                unit="años"
                trend={getTrendIndicator(latest.metabolicAge, previous?.metabolicAge ?? null)}
              />
              <MetricCard
                label="% Grasa Visceral"
                value={latest.visceralFatPercentage}
                previousValue={previous?.visceralFatPercentage ?? null}
                unit="%"
                trend={getTrendIndicator(latest.visceralFatPercentage, previous?.visceralFatPercentage ?? null)}
              />
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Todavía no tenés mediciones cargadas.</p>
        )}
      </div>

      {sortedBio.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 p-4 sm:p-6 pb-0">Historial de Registros</h3>

          {/* Mobile: card list */}
          <ul className="md:hidden divide-y divide-gray-100 p-4 sm:p-6 pt-4">
            {sortedBio.map(record => (
              <li key={record.id} className="py-4 first:pt-0">
                <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <p className="font-semibold text-gray-900">{formatLocalDate(record.date)}</p>
                    {record.status === "pending" ? (
                      <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Peso</span>
                      <p className="font-medium text-gray-900">{record.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-500">IMC</span>
                      <p className="font-medium text-gray-900">{record.imc ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">% Grasa</span>
                      <p className="font-medium text-gray-900">{record.bodyFatPercentage ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">% Músculo</span>
                      <p className="font-medium text-gray-900">{record.muscleMassPercentage ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Kcal</span>
                      <p className="font-medium text-gray-900">{record.kcal ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Edad met.</span>
                      <p className="font-medium text-gray-900">{record.metabolicAge ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">% Visceral</span>
                      <p className="font-medium text-gray-900">{record.visceralFatPercentage ?? "—"}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-gray-500">Estatura</span>
                      <p className="font-medium text-gray-900">{record.height ?? "—"} cm</p>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">{record.notes}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto p-4 sm:p-6 pt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatura (cm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Grasa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Músculo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KCAL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad Metabólica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Grasa Visceral
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBio.map(record => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatLocalDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.height ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.imc ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.bodyFatPercentage ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.muscleMassPercentage ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.kcal ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.metabolicAge ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.visceralFatPercentage ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.notes || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.status === "pending" ? (
                        <span className="inline-flex text-xs font-semibold rounded-full px-2 py-1 bg-amber-100 text-amber-800">
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex text-xs font-semibold rounded-full px-2 py-1 bg-green-100 text-green-800">
                          Confirmado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setForm(emptyForm());
          setFormError("");
        }}
        title="Registrar medición"
        size="lg"
        onSubmit={handleSubmit}
        submitLabel="Guardar"
        loading={isSaving}
        error={formError}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              required
              value={form.date}
              onChange={e => setField("date", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              step="0.1"
              min="0"
              required
              value={form.weight}
              onChange={e => setField("weight", e.target.value)}
              placeholder="Ej. 72.5"
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
              Estatura (cm)
            </label>
            <input
              type="number"
              id="height"
              step="0.1"
              min="0"
              value={form.height}
              onChange={e => setField("height", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="imc" className="block text-sm font-semibold text-gray-700 mb-2">
              IMC
            </label>
            <input
              type="number"
              id="imc"
              step="0.1"
              min="0"
              value={form.imc}
              onChange={e => setField("imc", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bodyFatPercentage" className="block text-sm font-semibold text-gray-700 mb-2">
              % Grasa corporal
            </label>
            <input
              type="number"
              id="bodyFatPercentage"
              step="0.1"
              min="0"
              value={form.bodyFatPercentage}
              onChange={e => setField("bodyFatPercentage", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="muscleMassPercentage" className="block text-sm font-semibold text-gray-700 mb-2">
              % Masa muscular
            </label>
            <input
              type="number"
              id="muscleMassPercentage"
              step="0.1"
              min="0"
              value={form.muscleMassPercentage}
              onChange={e => setField("muscleMassPercentage", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="kcal" className="block text-sm font-semibold text-gray-700 mb-2">
              KCAL
            </label>
            <input
              type="number"
              id="kcal"
              step="1"
              min="0"
              value={form.kcal}
              onChange={e => setField("kcal", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="metabolicAge" className="block text-sm font-semibold text-gray-700 mb-2">
              Edad metabólica
            </label>
            <input
              type="number"
              id="metabolicAge"
              step="1"
              min="0"
              value={form.metabolicAge}
              onChange={e => setField("metabolicAge", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="visceralFatPercentage" className="block text-sm font-semibold text-gray-700 mb-2">
              % Grasa visceral
            </label>
            <input
              type="number"
              id="visceralFatPercentage"
              step="0.1"
              min="0"
              value={form.visceralFatPercentage}
              onChange={e => setField("visceralFatPercentage", e.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <input
            type="text"
            id="notes"
            value={form.notes}
            onChange={e => setField("notes", e.target.value)}
            disabled={isSaving}
            className={inputClass}
          />
        </div>

        <p className="text-xs text-gray-500">Solo el peso es obligatorio — completá el resto si tu balanza los mide.</p>
      </FormModal>
    </div>
  );
}
