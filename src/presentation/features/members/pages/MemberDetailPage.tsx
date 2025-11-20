import { useState, type FormEvent } from "react";
import type { MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { CreatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { PaymentSection } from "../components/PaymentSection";
import { Modal } from "../../../shared/components/Modal";
import { Tabs } from "../../../shared/components/Tabs";

interface MemberDetailPageProps {
  details: MemberDetails | null;
  loading: boolean;
  error?: string;
  onSubmit: (bioData: CreateBioimpedanceDTO) => Promise<void>;
  membershipPlan: MembershipPlan | null;
  paymentStatus: PaymentStatusResult | null;
  paymentLoading: boolean;
  onRecordPayment: (payment: CreatePaymentDTO) => Promise<void>;
  onUpdatePlan: (plan: {
    monthlyFee: number;
    weeklyFrequency: number;
    startDate: Date;
    isActive: boolean;
  }) => Promise<void>;
}

// Helper function to format dates correctly in local timezone
const formatLocalDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  // Adjust for timezone offset to get local date
  const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString("es-ES", options);
};

// Helper function to compare values and return indicator
const getTrendIndicator = (current: number, previous: number | null): { icon: string; color: string } | null => {
  if (previous === null) return null;

  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return null; // Ignore very small differences

  if (diff > 0) {
    return { icon: "▲", color: "text-red-500" };
  } else {
    return { icon: "▼", color: "text-green-500" };
  }
};

// Helper function to render metric with trend indicator
const MetricCard = ({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: number;
  unit: string;
  trend: { icon: string; color: string } | null;
}) => (
  <div className=" border border-gray-200 p-4 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs text-gray-600 font-semibold">{label}</p>
    </div>
    <div className="flex items-center justify-between mb-1">
      <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {value} {unit}{" "}
        {trend && (
          <span className={`text-md ${trend.color} font-bold`} title={trend.icon === "▲" ? "Aumentó" : "Disminuyó"}>
            {trend.icon}
          </span>
        )}
      </p>
    </div>
  </div>
);

export function MemberDetailPage({
  details,
  loading,
  onSubmit,
  membershipPlan,
  paymentStatus,
  paymentLoading,
  onRecordPayment,
  onUpdatePlan,
}: MemberDetailPageProps) {
  const [activeTab, setActiveTab] = useState("bioimpedancia");
  const [showBioModal, setShowBioModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    height: "",
    weight: "",
    imc: "",
    bodyFatPercentage: "",
    muscleMassPercentage: "",
    kcal: "",
    metabolicAge: "",
    visceralFatPercentage: "",
    notes: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!details) return;

    try {
      const bioData: CreateBioimpedanceDTO = {
        memberId: details.member.id,
        date: new Date(formData.date),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        imc: parseFloat(formData.imc),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        muscleMassPercentage: parseFloat(formData.muscleMassPercentage),
        kcal: parseFloat(formData.kcal),
        metabolicAge: parseFloat(formData.metabolicAge),
        visceralFatPercentage: parseFloat(formData.visceralFatPercentage),
        notes: formData.notes || undefined,
      };

      await onSubmit(bioData);
      setShowBioModal(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        height: "",
        weight: "",
        imc: "",
        bodyFatPercentage: "",
        muscleMassPercentage: "",
        kcal: "",
        metabolicAge: "",
        visceralFatPercentage: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error recording bioimpedance:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!details) {
    return <div>Miembro no encontrado</div>;
  }

  const { member, bioimpedances: bioimpedanceRecords } = details;

  const latestBioimpedance = bioimpedanceRecords.length > 0 ? bioimpedanceRecords[0] : null;
  const previousBioimpedance = bioimpedanceRecords.length > 1 ? bioimpedanceRecords[1] : null;
  const historicalRecords = bioimpedanceRecords.slice(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Member Header */}
      <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
              <span>{member.email}</span>
              <span className="hidden sm:block text-gray-400">·</span>
              <span>{formatLocalDate(member.dateOfBirth)}</span>
              <span className="hidden sm:block text-gray-400">·</span>
              <span className="capitalize">
                {member.gender === "male" ? "M" : member.gender === "female" ? "F" : "O"}
              </span>
            </div>
          </div>

          {/* Payment Summary Badges */}
          {!paymentLoading && membershipPlan && paymentStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 bg-gray-50 rounded-lg ${paymentStatus.isOverdue ? "border-2 border-red-500" : ""}`}>
                <p className="text-xs text-gray-600 mb-1">Estado</p>
                <p className={`text-lg font-bold ${paymentStatus.isOverdue ? "text-red-600" : "text-green-600"}`}>
                  {paymentStatus.isOverdue ? formatCurrency(paymentStatus.totalDebt) : "Al día"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Cuota Mensual</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(membershipPlan.monthlyFee)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Frecuencia</p>
                <p className="text-lg font-bold text-gray-900">{membershipPlan.weeklyFrequency}x por semana</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "bioimpedancia", label: "Bioimpedancia" },
          { id: "pagos", label: "Pagos" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === "bioimpedancia" && (
        <div>
          {/* Bioimpedance Section Header */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Registros de Bioimpedancia</h2>
            <button
              onClick={() => setShowBioModal(true)}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              + Nuevo Registro
            </button>
          </div>

          {/* Latest Bioimpedance Values */}
          {latestBioimpedance ? (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Últimos Valores</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatLocalDate(latestBioimpedance.date, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Estatura"
                  value={latestBioimpedance.height}
                  unit="cm"
                  trend={getTrendIndicator(latestBioimpedance.height, previousBioimpedance?.height ?? null)}
                />
                <MetricCard
                  label="Peso"
                  value={latestBioimpedance.weight}
                  unit="kg"
                  trend={getTrendIndicator(latestBioimpedance.weight, previousBioimpedance?.weight ?? null)}
                />
                <MetricCard
                  label="IMC"
                  value={latestBioimpedance.imc}
                  unit=""
                  trend={getTrendIndicator(latestBioimpedance.imc, previousBioimpedance?.imc ?? null)}
                />
                <MetricCard
                  label="% Grasa"
                  value={latestBioimpedance.bodyFatPercentage}
                  unit="%"
                  trend={getTrendIndicator(
                    latestBioimpedance.bodyFatPercentage,
                    previousBioimpedance?.bodyFatPercentage ?? null
                  )}
                />
                <MetricCard
                  label="% Músculo"
                  value={latestBioimpedance.muscleMassPercentage}
                  unit="%"
                  trend={getTrendIndicator(
                    latestBioimpedance.muscleMassPercentage,
                    previousBioimpedance?.muscleMassPercentage ?? null
                  )}
                />
                <MetricCard
                  label="KCAL"
                  value={latestBioimpedance.kcal}
                  unit=""
                  trend={getTrendIndicator(latestBioimpedance.kcal, previousBioimpedance?.kcal ?? null)}
                />
                <MetricCard
                  label="Edad Metabólica"
                  value={latestBioimpedance.metabolicAge}
                  unit="años"
                  trend={getTrendIndicator(latestBioimpedance.metabolicAge, previousBioimpedance?.metabolicAge ?? null)}
                />
                <MetricCard
                  label="% Grasa Visceral"
                  value={latestBioimpedance.visceralFatPercentage}
                  unit="%"
                  trend={getTrendIndicator(
                    latestBioimpedance.visceralFatPercentage,
                    previousBioimpedance?.visceralFatPercentage ?? null
                  )}
                />
              </div>
              {latestBioimpedance.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Notas:</p>
                  <p className="text-sm text-gray-600">{latestBioimpedance.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-200 text-center text-gray-600">
              No hay registros de bioimpedancia para este miembro.
            </div>
          )}

          {/* Historical Bioimpedance Records */}
          {historicalRecords.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Registros</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estatura (cm)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Peso (kg)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        IMC
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        % Grasa
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        % Músculo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        KCAL
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Edad Metabólica
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        % Grasa Visceral
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatLocalDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.height}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.imc}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.bodyFatPercentage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.muscleMassPercentage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.kcal}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.metabolicAge}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.visceralFatPercentage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "pagos" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Pagos</h2>
          <PaymentSection
            memberId={details.member.id}
            membershipPlan={membershipPlan}
            paymentStatus={paymentStatus}
            loading={paymentLoading}
            onRecordPayment={onRecordPayment}
            onUpdatePlan={onUpdatePlan}
          />
        </div>
      )}

      {/* Bioimpedance Registration Modal */}
      <Modal isOpen={showBioModal} onClose={() => setShowBioModal(false)} title="Registrar Bioimpedancia" size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estatura (cm)</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.height}
              onChange={e => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Ej: 175"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">IMC</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.imc}
              onChange={e => setFormData({ ...formData, imc: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">% de Grasa</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.bodyFatPercentage}
              onChange={e => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">% de Músculo</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.muscleMassPercentage}
              onChange={e => setFormData({ ...formData, muscleMassPercentage: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">KCAL</label>
            <input
              type="number"
              required
              value={formData.kcal}
              onChange={e => setFormData({ ...formData, kcal: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Calorías"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Edad Metabólica</label>
            <input
              type="number"
              required
              value={formData.metabolicAge}
              onChange={e => setFormData({ ...formData, metabolicAge: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Años"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">% Grasa Visceral</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.visceralFatPercentage}
              onChange={e => setFormData({ ...formData, visceralFatPercentage: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Observaciones adicionales..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
