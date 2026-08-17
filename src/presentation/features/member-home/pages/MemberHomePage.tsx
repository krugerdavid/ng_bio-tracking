import { useState, type FormEvent } from "react";
import type { Member } from "@domain/member/entities/Member";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { PageLoader } from "@presentation/shared/components/PageLoader";
import { FormModal } from "@presentation/shared/components/FormModal";
import { formatCurrency, formatLocalDate } from "@presentation/shared/utils/formatters";

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300";

interface MemberHomePageProps {
  member: Member | null;
  bioimpedances: Bioimpedance[];
  paymentStatus: PaymentStatusResult | null;
  loading: boolean;
  error?: string;
  onRegisterWeight: (data: { date: Date; weight: number; notes?: string }) => Promise<void>;
}

export function MemberHomePage({
  member,
  bioimpedances,
  paymentStatus,
  loading,
  error,
  onRegisterWeight,
}: MemberHomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setWeight("");
    setNotes("");
    setFormError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const weightValue = parseFloat(weight);
    if (Number.isNaN(weightValue) || weightValue <= 0) {
      setFormError("Ingresá un peso válido.");
      return;
    }

    setIsSaving(true);
    try {
      await onRegisterWeight({ date: new Date(date), weight: weightValue, notes: notes || undefined });
      setIsModalOpen(false);
      resetForm();
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
          Registrar mi peso
        </button>
      </div>

      {paymentStatus && (
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

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Bioimpedancia</h3>
        {latest ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Peso</p>
              <p className="text-lg font-semibold text-gray-900">{latest.weight} kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">IMC</p>
              <p className="text-lg font-semibold text-gray-900">{latest.imc ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">% Grasa</p>
              <p className="text-lg font-semibold text-gray-900">
                {latest.bodyFatPercentage !== undefined ? `${latest.bodyFatPercentage}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">% Músculo</p>
              <p className="text-lg font-semibold text-gray-900">
                {latest.muscleMassPercentage !== undefined ? `${latest.muscleMassPercentage}%` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4">Todavía no tenés mediciones cargadas.</p>
        )}

        {sortedBio.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Historial</p>
            <ul className="divide-y divide-gray-100">
              {sortedBio.map(b => (
                <li key={b.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{formatLocalDate(b.date)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">{b.weight} kg</span>
                    {b.status === "pending" ? (
                      <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Registrar mi peso"
        onSubmit={handleSubmit}
        submitLabel="Guardar"
        loading={isSaving}
        error={formError}
      >
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
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
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="Ej. 72.5"
            disabled={isSaving}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={isSaving}
            className={inputClass}
          />
        </div>
      </FormModal>
    </div>
  );
}
