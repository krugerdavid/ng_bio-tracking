import { useState, type FormEvent } from "react";
import type { CreatePaymentDTO, UpdatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { FormModal } from "../../../shared/components/FormModal";
import { CurrencyInput } from "../../../shared/components/CurrencyInput";
import { DeleteConfirmationModal } from "../../../shared/components/DeleteConfirmationModal";
import { formatCurrency, formatShortMonth } from "@presentation/shared/utils/formatters";

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
  onUpdatePayment: (id: string, data: UpdatePaymentDTO) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
}

export function PaymentSection({
  memberId,
  membershipPlan,
  paymentStatus,
  loading,
  onRecordPayment,
  onUpdatePlan,
  onUpdatePayment,
  onDeletePayment,
}: PaymentSectionProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<{ id: string; month: string } | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; month: string } | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState("");
  const defaultPaymentMonth = (status: PaymentStatusResult | null): string =>
    status && status.overdueMonths.length > 0 ? status.overdueMonths[0] : new Date().toISOString().slice(0, 7);

  const [paymentFormData, setPaymentFormData] = useState({
    month: defaultPaymentMonth(paymentStatus),
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
    setPaymentFormError("");
    if (!membershipPlan) {
      setPaymentFormError("Por favor configure el plan de membresía primero");
      return;
    }

    const amount = parseFloat(paymentFormData.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setPaymentFormError("El monto debe ser un número mayor a 0.");
      return;
    }

    setIsSavingPayment(true);
    try {
      if (editingPayment) {
        const updateData: UpdatePaymentDTO = {
          month: paymentFormData.month,
          amount,
          paymentDate: new Date(paymentFormData.paymentDate),
          status: "paid",
          notes: paymentFormData.notes || undefined,
        };
        await onUpdatePayment(editingPayment.id, updateData);
      } else {
        await onRecordPayment({
          memberId,
          month: paymentFormData.month,
          amount,
          paymentDate: new Date(paymentFormData.paymentDate),
          status: "paid",
          notes: paymentFormData.notes || undefined,
        });
      }

      setShowPaymentModal(false);
      setEditingPayment(null);
      setPaymentFormData({
        month: defaultPaymentMonth(paymentStatus),
        amount: membershipPlan.monthlyFee.toString(),
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } catch (error) {
      console.error("Error saving payment:", error);
      setPaymentFormError(error instanceof Error ? error.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeletingPayment(true);
    try {
      await onDeletePayment(paymentToDelete.id);
      setShowDeletePaymentModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsDeletingPayment(false);
    }
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

  const amountNum = parseFloat(paymentFormData.amount);
  const paymentExcess =
    !editingPayment &&
    paymentStatus &&
    paymentStatus.totalDebt > 0 &&
    !Number.isNaN(amountNum) &&
    amountNum > paymentStatus.totalDebt
      ? amountNum - paymentStatus.totalDebt
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header with Action Button */}
      <div className="flex flex-row justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Pagos</h2>
        <button
          onClick={() => {
            setEditingPayment(null);
            setPaymentFormData({
              month: defaultPaymentMonth(paymentStatus),
              amount: membershipPlan?.monthlyFee?.toString() || "",
              paymentDate: new Date().toISOString().split("T")[0],
              notes: "",
            });
            setShowPaymentModal(true);
          }}
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
          className={`rounded-2xl shadow-sm border p-6 ${
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
      <div className="bg-white rounded-2xl shadow-sm border-gray-200 p-6">
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
        <div className="mb-8 bg-white rounded-2xl shadow-sm  border-gray-200 p-4 sm:p-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPayment({ id: payment.id, month: payment.month });
                            setPaymentFormData({
                              month: payment.month,
                              amount: payment.amount.toString(),
                              paymentDate: new Date(payment.paymentDate).toISOString().split("T")[0],
                              notes: payment.notes || "",
                            });
                            setShowPaymentModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setPaymentToDelete({ id: payment.id, month: payment.month });
                            setShowDeletePaymentModal(true);
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Registration Modal */}
      <FormModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPayment(null);
          setPaymentFormError("");
        }}
        title={editingPayment ? "Editar Pago" : "Registrar Pago"}
        size="md"
        onSubmit={handleRecordPayment}
        submitLabel={isSavingPayment ? "Guardando..." : "Confirmar Pago"}
        loading={isSavingPayment}
        error={paymentFormError}
      >
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
            {membershipPlan && (
              <div className="mt-2 space-y-1">
                {!editingPayment && paymentStatus && paymentStatus.totalDebt > 0 && (
                  <>
                    <p className="text-sm text-gray-600">
                      Deuda actual:{" "}
                      <span className="font-semibold text-gray-900">{formatCurrency(paymentStatus.totalDebt)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentFormData({
                          ...paymentFormData,
                          amount: paymentStatus.totalDebt.toString(),
                        })
                      }
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      Usar deuda actual
                    </button>
                  </>
                )}
                {!editingPayment && (!paymentStatus || paymentStatus.totalDebt === 0) && (
                  <p className="text-sm text-gray-500">Cuota sugerida: {formatCurrency(membershipPlan.monthlyFee)}</p>
                )}
                {editingPayment && (
                  <p className="text-sm text-gray-500">Cuota del plan: {formatCurrency(membershipPlan.monthlyFee)}</p>
                )}
                {paymentExcess > 0 && (
                  <p className="text-sm text-green-700 mt-1">
                    El excedente ({formatCurrency(paymentExcess)}) quedará a favor del deportista y se aplicará a
                    futuros pagos.
                  </p>
                )}
              </div>
            )}
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
      </FormModal>

      {/* Membership Plan Modal */}
      <FormModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={membershipPlan ? "Editar Plan de Membresía" : "Configurar Plan de Membresía"}
        size="md"
        onSubmit={handleUpdatePlan}
        submitLabel="Guardar Plan"
      >
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
      </FormModal>

      <DeleteConfirmationModal
        isOpen={showDeletePaymentModal}
        onClose={() => {
          setShowDeletePaymentModal(false);
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeletePayment}
        title="Eliminar Pago"
        message="¿Estás seguro que deseas eliminar este pago? Esta acción no se puede deshacer."
        itemName={paymentToDelete ? formatShortMonth(paymentToDelete.month) : undefined}
        loading={isDeletingPayment}
      />
    </div>
  );
}
