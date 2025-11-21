import { useState, type FormEvent } from "react";
import type { CreatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { Modal } from "../../../shared/components/Modal";
import { CurrencyInput } from "../../../shared/components/CurrencyInput";

interface PaymentSectionProps {
  memberId: string;
  membershipPlan: MembershipPlan | null;
  paymentStatus: PaymentStatusResult | null;
  loading: boolean;
  onRecordPayment: (payment: CreatePaymentDTO) => Promise<void>;
  onUpdatePlan: (plan: {
    monthlyFee: number;
    weeklyFrequency: number;
    startDate: Date;
    isActive: boolean;
  }) => Promise<void>;
}

export function PaymentSection({
  memberId,
  membershipPlan,
  paymentStatus,
  loading,
  onRecordPayment,
  onUpdatePlan,
}: PaymentSectionProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: membershipPlan?.monthlyFee?.toString() || "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [planFormData, setPlanFormData] = useState({
    monthlyFee: membershipPlan?.monthlyFee?.toString() || "",
    weeklyFrequency: membershipPlan?.weeklyFrequency || 3,
    startDate: membershipPlan?.startDate
      ? new Date(membershipPlan.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const handleRecordPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!membershipPlan) {
      alert("Por favor configure el plan de membresía primero");
      return;
    }

    await onRecordPayment({
      memberId,
      month: paymentFormData.month,
      amount: parseFloat(paymentFormData.amount),
      paymentDate: new Date(paymentFormData.paymentDate),
      status: "paid",
      notes: paymentFormData.notes || undefined,
    });

    setShowPaymentModal(false);
    setPaymentFormData({
      month: new Date().toISOString().slice(0, 7),
      amount: membershipPlan.monthlyFee.toString(),
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleUpdatePlan = async (e: FormEvent) => {
    e.preventDefault();
    await onUpdatePlan({
      monthlyFee: parseFloat(planFormData.monthlyFee),
      weeklyFrequency: planFormData.weeklyFrequency,
      startDate: new Date(planFormData.startDate),
      isActive: true,
    });
    setShowPlanModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    // Format: "AGO 2024"
    const shortMonth = date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
    return `${shortMonth} ${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Action Button */}
      <div className="flex flex-row justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Pagos</h2>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="
            flex items-center justify-center gap-2
            w-10 h-10 sm:w-auto sm:h-auto
            rounded-full sm:rounded-lg
            p-0 sm:px-6 sm:py-3
            bg-orange-500 text-white font-semibold 
            shadow-lg hover:bg-orange-600 
            active:bg-orange-700 transform hover:-translate-y-0.5 active:translate-y-0 
            transition-all duration-300 touch-manipulation
          "
          aria-label="Registrar Pago"
        >
          <span className="text-2xl sm:text-xl leading-none mb-1 sm:mb-0">+</span>
          <span className="hidden sm:block">Registrar Pago</span>
        </button>
      </div>

      {/* Payment Status Banner */}
      {membershipPlan && paymentStatus && (
        <div
          className={`rounded-2xl shadow-xl border p-6 ${
            paymentStatus.isOverdue ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold ${paymentStatus.isOverdue ? "text-red-900" : "text-green-900"}`}>
                {paymentStatus.isOverdue ? "⚠️ Pagos Pendientes" : "✅ Al Día"}
              </h3>
              {paymentStatus.isOverdue && (
                <p className="text-red-700 mt-2">
                  <span className="font-semibold">Deuda total:</span> {formatCurrency(paymentStatus.totalDebt)}
                </p>
              )}
            </div>
            {/* Button moved to header */}
          </div>

          {/* Overdue Months */}
          {paymentStatus.isOverdue && paymentStatus.overdueMonths.length > 0 && (
            <div className="mt-4 bg-white rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-2">Meses adeudados:</p>
              <div className="flex flex-wrap gap-2">
                {paymentStatus.overdueMonths.map(month => (
                  <span
                    key={month}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded-md font-bold text-xs border border-red-200"
                  >
                    {formatShortMonth(month)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Membership Plan Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Plan de Membresía</h3>
          <button
            onClick={() => {
              // Update form data with current plan values when opening
              if (membershipPlan) {
                setPlanFormData({
                  monthlyFee: membershipPlan.monthlyFee.toString(),
                  weeklyFrequency: membershipPlan.weeklyFrequency,
                  startDate: new Date(membershipPlan.startDate).toISOString().split("T")[0],
                });
              }
              setShowPlanModal(true);
            }}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            {membershipPlan ? "Editar" : "Configurar"}
          </button>
        </div>

        {membershipPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Cuota Mensual</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(membershipPlan.monthlyFee)}</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Frecuencia</p>
              <p className="text-2xl font-bold text-gray-900">{membershipPlan.weeklyFrequency}x por semana</p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Inicio</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(membershipPlan.startDate).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Configure el plan de membresía para comenzar</p>
        )}
      </div>

      {/* Payment History */}
      {paymentStatus && paymentStatus.payments.length > 0 && (
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Historial de Pagos</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentStatus.payments.map(payment => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatShortMonth(payment.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.paymentDate).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status === "paid" ? "Pagado" : payment.status === "overdue" ? "Vencido" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Registration Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pago"
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              type="submit"
              form="payment-form"
              className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600"
            >
              Confirmar Pago
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        }
      >
        <form id="payment-form" onSubmit={handleRecordPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
              <input
                type="month"
                required
                value={paymentFormData.month}
                onChange={e => setPaymentFormData({ ...paymentFormData, month: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <CurrencyInput
                label="Monto (Gs.)"
                id="amount"
                required
                value={paymentFormData.amount}
                onChange={value => setPaymentFormData({ ...paymentFormData, amount: value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Pago</label>
            <input
              type="date"
              required
              value={paymentFormData.paymentDate}
              onChange={e => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              value={paymentFormData.notes}
              onChange={e => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Observaciones..."
            />
          </div>
        </form>
      </Modal>

      {/* Membership Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={membershipPlan ? "Editar Plan de Membresía" : "Configurar Plan de Membresía"}
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              type="submit"
              form="plan-form"
              className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600"
            >
              Guardar Plan
            </button>
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        }
      >
        <form id="plan-form" onSubmit={handleUpdatePlan} className="space-y-4">
          <div>
            <CurrencyInput
              label="Cuota Mensual (Gs.)"
              required
              value={planFormData.monthlyFee}
              onChange={value => setPlanFormData({ ...planFormData, monthlyFee: value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: 150.000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia Semanal</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setPlanFormData({ ...planFormData, weeklyFrequency: freq })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    planFormData.weeklyFrequency === freq
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {freq}x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Entrenamientos de lunes a viernes, 1 hora por día</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Inicio</label>
            <input
              type="date"
              required
              value={planFormData.startDate}
              onChange={e => setPlanFormData({ ...planFormData, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
