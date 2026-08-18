import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { CreateBioimpedanceDTO, UpdateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { CreatePaymentDTO, UpdatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { PaymentSection } from "../components/PaymentSection";
import { UpdateMemberModal } from "../components/UpdateMemberModal";
import { InviteMemberModal } from "../components/InviteMemberModal";
import { FormModal } from "../../../shared/components/FormModal";
import { Tabs } from "../../../shared/components/Tabs";
import { PageLoader } from "../../../shared/components/PageLoader";
import { DeleteConfirmationModal } from "../../../shared/components/DeleteConfirmationModal";
import { MetricCard } from "../../../shared/components/MetricCard";
import { getTrendIndicator } from "../../../shared/utils/bioimpedanceTrend";
import { formatWithThousandsSeparator, formatCurrency, formatLocalDate } from "../../../shared/utils/formatters";

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
  onUpdateMember: () => Promise<void>;
  onDeleteMember: () => Promise<void>;
  onInviteMember: (email?: string) => Promise<void>;
  onUpdateBioimpedance: (id: string, data: UpdateBioimpedanceDTO) => Promise<void>;
  onDeleteBioimpedance: (id: string) => Promise<void>;
  onUpdatePayment: (id: string, data: UpdatePaymentDTO) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
}

export function MemberDetailPage({
  details,
  loading,
  onSubmit,
  membershipPlan,
  paymentStatus,
  paymentLoading,
  onRecordPayment,
  onUpdatePlan,
  onUpdateMember,
  onDeleteMember,
  onInviteMember,
  onUpdateBioimpedance,
  onDeleteBioimpedance,
  onUpdatePayment,
  onDeletePayment,
}: MemberDetailPageProps) {
  const [activeTab, setActiveTab] = useState("bioimpedancia");
  const [showBioModal, setShowBioModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string>("");
  const [showDeleteBioModal, setShowDeleteBioModal] = useState(false);
  const [editingBioimpedance, setEditingBioimpedance] = useState<{ id: string; date: Date } | null>(null);
  const [bioimpedanceToDelete, setBioimpedanceToDelete] = useState<{ id: string; date: string } | null>(null);
  const [isDeletingBio, setIsDeletingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [bioFormError, setBioFormError] = useState<string>("");
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
    setBioFormError("");
    if (!details) return;

    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const imc = parseFloat(formData.imc);
    const bodyFatPercentage = parseFloat(formData.bodyFatPercentage);
    const muscleMassPercentage = parseFloat(formData.muscleMassPercentage);
    const kcal = parseFloat(formData.kcal);
    const metabolicAge = parseFloat(formData.metabolicAge);
    const visceralFatPercentage = parseFloat(formData.visceralFatPercentage);

    if (
      [height, weight, imc, bodyFatPercentage, muscleMassPercentage, kcal, metabolicAge, visceralFatPercentage].some(
        Number.isNaN
      )
    ) {
      setBioFormError("Todos los campos numéricos deben tener un valor válido.");
      return;
    }

    setIsSavingBio(true);
    try {
      if (editingBioimpedance) {
        const updateData: UpdateBioimpedanceDTO = {
          date: new Date(formData.date),
          height,
          weight,
          imc,
          bodyFatPercentage,
          muscleMassPercentage,
          kcal,
          metabolicAge,
          visceralFatPercentage,
          notes: formData.notes || undefined,
          status: "confirmed",
        };
        await onUpdateBioimpedance(editingBioimpedance.id, updateData);
      } else {
        const bioData: CreateBioimpedanceDTO = {
          memberId: details.member.id,
          date: new Date(formData.date),
          height,
          weight,
          imc,
          bodyFatPercentage,
          muscleMassPercentage,
          kcal,
          metabolicAge,
          visceralFatPercentage,
          notes: formData.notes || undefined,
        };
        await onSubmit(bioData);
      }
      setShowBioModal(false);
      setEditingBioimpedance(null);
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
      console.error("Error saving bioimpedance:", error);
      setBioFormError(error instanceof Error ? error.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleDeleteBioimpedance = async () => {
    if (!bioimpedanceToDelete) return;
    setIsDeletingBio(true);
    try {
      await onDeleteBioimpedance(bioimpedanceToDelete.id);
      setShowDeleteBioModal(false);
      setBioimpedanceToDelete(null);
    } catch (error) {
      console.error("Error deleting bioimpedance:", error);
    } finally {
      setIsDeletingBio(false);
    }
  };

  const [confirmingBioId, setConfirmingBioId] = useState<string | null>(null);
  const handleConfirmBioimpedance = async (id: string) => {
    setConfirmingBioId(id);
    try {
      await onUpdateBioimpedance(id, { status: "confirmed" });
    } catch (error) {
      console.error("Error confirming bioimpedance:", error);
    } finally {
      setConfirmingBioId(null);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!details) {
    return <div>Miembro no encontrado</div>;
  }

  const { member, bioimpedances: bioimpedanceRecords } = details;

  const latestBioimpedance = bioimpedanceRecords.length > 0 ? bioimpedanceRecords[0] : null;
  const previousBioimpedance = bioimpedanceRecords.length > 1 ? bioimpedanceRecords[1] : null;
  const historicalRecords = bioimpedanceRecords;

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link
          to="/members"
          className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la lista
        </Link>
      </div>

      {/* Member Header */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setInviteFeedback("");
                    setShowInviteModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200"
                  title={member.userId ? "Reenviar acceso a la app" : "Dar acceso a la app"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200"
                  title="Editar información"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Eliminar miembro"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2 truncate">
              {formatWithThousandsSeparator(member.documentNumber)} &middot; {member.email || "Sin email"}
            </p>
            {member.userId ? (
              <p className="text-xs text-green-700 mb-2 font-medium">Acceso a la app: activo</p>
            ) : (
              <p className="text-xs text-amber-700 mb-2 font-medium">Acceso a la app: sin invitar</p>
            )}
            {inviteFeedback && (
              <p className="text-xs text-green-700 mb-2 bg-green-50 border border-green-100 rounded-md px-2 py-1">
                {inviteFeedback}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {member.age} años
              </span>
              <span className="capitalize">
                {member.gender === "male" ? "M" : member.gender === "female" ? "F" : "O"}
              </span>
              {member.documentNumber && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.5 2-2 2h4c-1.5 0-2-1.116-2-2z"
                    />
                  </svg>
                  {member.documentNumber}
                </span>
              )}
            </div>
          </div>

          {/* Payment Summary Badges */}
          {!paymentLoading && membershipPlan && paymentStatus && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div
                className={`p-3  border rounded-lg shadow-sm ${paymentStatus.isOverdue ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
              >
                <p className="text-xs  leading-none text-gray-600 mb-1">Estado</p>
                <p
                  className={`text-md sm:text-lg leading-tight font-bold ${paymentStatus.isOverdue ? "text-red-600" : "text-green-600"}`}
                >
                  {paymentStatus.isOverdue ? formatCurrency(paymentStatus.totalDebt) : "Al día"}
                </p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-xs leading-none  text-gray-600 mb-1">Cuota Mensual</p>
                <p className="text-md sm:text-lg leading-tight font-bold text-gray-900">
                  {formatCurrency(membershipPlan.monthlyFee)}
                </p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-xs leading-none  text-gray-600 mb-1">Frecuencia</p>
                <p className="text-md sm:text-lg leading-tight font-bold text-gray-900">
                  {membershipPlan.weeklyFrequency}x por semana
                </p>
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
        <div className="space-y-6">
          {/* Bioimpedance Section Header */}
          <div className="flex flex-row justify-between items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión Bioimpedancia</h2>
            <button
              onClick={() => {
                setBioFormError("");
                setEditingBioimpedance(null);
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
                setShowBioModal(true);
              }}
              className="
                flex items-center justify-center gap-2
                w-12 h-12 sm:w-auto sm:h-auto
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
              <span className="hidden sm:block">Registrar</span>
            </button>
          </div>

          {/* Latest Bioimpedance Values */}
          {latestBioimpedance ? (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800">Últimos Valores</h3>
                    {latestBioimpedance.status === "pending" && (
                      <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatLocalDate(latestBioimpedance.date, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {latestBioimpedance.status === "pending" && (
                    <button
                      onClick={() => handleConfirmBioimpedance(latestBioimpedance.id)}
                      disabled={confirmingBioId === latestBioimpedance.id}
                      className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                      {confirmingBioId === latestBioimpedance.id ? "Confirmando…" : "Confirmar"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setBioFormError("");
                      setEditingBioimpedance({ id: latestBioimpedance.id, date: latestBioimpedance.date });
                      setFormData({
                        date: new Date(latestBioimpedance.date).toISOString().split("T")[0],
                        height: latestBioimpedance.height?.toString() ?? "",
                        weight: latestBioimpedance.weight.toString(),
                        imc: latestBioimpedance.imc?.toString() ?? "",
                        bodyFatPercentage: latestBioimpedance.bodyFatPercentage?.toString() ?? "",
                        muscleMassPercentage: latestBioimpedance.muscleMassPercentage?.toString() ?? "",
                        kcal: latestBioimpedance.kcal?.toString() ?? "",
                        metabolicAge: latestBioimpedance.metabolicAge?.toString() ?? "",
                        visceralFatPercentage: latestBioimpedance.visceralFatPercentage?.toString() ?? "",
                        notes: latestBioimpedance.notes ?? "",
                      });
                      setShowBioModal(true);
                    }}
                    className="text-orange-500 hover:text-orange-600 font-semibold"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                  label="Estatura"
                  value={latestBioimpedance.height}
                  previousValue={previousBioimpedance?.height ?? null}
                  unit="cm"
                  trend={getTrendIndicator(latestBioimpedance.height, previousBioimpedance?.height ?? null)}
                />
                <MetricCard
                  label="Peso"
                  value={latestBioimpedance.weight}
                  previousValue={previousBioimpedance?.weight ?? null}
                  unit="kg"
                  trend={getTrendIndicator(latestBioimpedance.weight, previousBioimpedance?.weight ?? null)}
                />
                <MetricCard
                  label="IMC"
                  value={latestBioimpedance.imc}
                  previousValue={previousBioimpedance?.imc ?? null}
                  unit=""
                  trend={getTrendIndicator(latestBioimpedance.imc, previousBioimpedance?.imc ?? null)}
                />
                <MetricCard
                  label="% Grasa"
                  value={latestBioimpedance.bodyFatPercentage}
                  previousValue={previousBioimpedance?.bodyFatPercentage ?? null}
                  unit="%"
                  trend={getTrendIndicator(
                    latestBioimpedance.bodyFatPercentage,
                    previousBioimpedance?.bodyFatPercentage ?? null
                  )}
                />
                <MetricCard
                  label="% Músculo"
                  value={latestBioimpedance.muscleMassPercentage}
                  previousValue={previousBioimpedance?.muscleMassPercentage ?? null}
                  unit="%"
                  trend={getTrendIndicator(
                    latestBioimpedance.muscleMassPercentage,
                    previousBioimpedance?.muscleMassPercentage ?? null
                  )}
                />
                <MetricCard
                  label="KCAL"
                  value={latestBioimpedance.kcal}
                  previousValue={previousBioimpedance?.kcal ?? null}
                  unit=""
                  trend={getTrendIndicator(latestBioimpedance.kcal, previousBioimpedance?.kcal ?? null)}
                />
                <MetricCard
                  label="Edad Metabólica"
                  value={latestBioimpedance.metabolicAge}
                  previousValue={previousBioimpedance?.metabolicAge ?? null}
                  unit="años"
                  trend={getTrendIndicator(latestBioimpedance.metabolicAge, previousBioimpedance?.metabolicAge ?? null)}
                />
                <MetricCard
                  label="% Grasa Visceral"
                  value={latestBioimpedance.visceralFatPercentage}
                  previousValue={previousBioimpedance?.visceralFatPercentage ?? null}
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
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border-gray-200 text-center text-gray-600">
              No hay registros de bioimpedancia para este miembro.
            </div>
          )}

          {/* Historical Bioimpedance Records */}
          {historicalRecords.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 p-4 sm:p-6 pb-0">Historial de Registros</h3>

              {/* Mobile: card list */}
              <ul className="md:hidden divide-y divide-gray-100 p-4 sm:p-6 pt-4">
                {historicalRecords.map(record => (
                  <li key={record.id} className="py-4 first:pt-0">
                    <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{formatLocalDate(record.date)}</p>
                          {record.status === "pending" && (
                            <span className="inline-flex text-xs font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {record.status === "pending" && (
                            <button
                              onClick={() => handleConfirmBioimpedance(record.id)}
                              disabled={confirmingBioId === record.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                              {confirmingBioId === record.id ? "Confirmando…" : "Confirmar"}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingBioimpedance({ id: record.id, date: record.date });
                              setFormData({
                                date: new Date(record.date).toISOString().split("T")[0],
                                height: record.height?.toString() ?? "",
                                weight: record.weight.toString(),
                                imc: record.imc?.toString() ?? "",
                                bodyFatPercentage: record.bodyFatPercentage?.toString() ?? "",
                                muscleMassPercentage: record.muscleMassPercentage?.toString() ?? "",
                                kcal: record.kcal?.toString() ?? "",
                                metabolicAge: record.metabolicAge?.toString() ?? "",
                                visceralFatPercentage: record.visceralFatPercentage?.toString() ?? "",
                                notes: record.notes || "",
                              });
                              setShowBioModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                            aria-label="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              setBioimpedanceToDelete({ id: record.id, date: formatLocalDate(record.date) });
                              setShowDeleteBioModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                            aria-label="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Peso</span>
                          <p className="font-medium text-gray-900">{record.weight} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-500">IMC</span>
                          <p className="font-medium text-gray-900">{record.imc}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">% Grasa</span>
                          <p className="font-medium text-gray-900">{record.bodyFatPercentage}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">% Músculo</span>
                          <p className="font-medium text-gray-900">{record.muscleMassPercentage}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Kcal</span>
                          <p className="font-medium text-gray-900">{record.kcal}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Edad met.</span>
                          <p className="font-medium text-gray-900">{record.metabolicAge}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">% Visceral</span>
                          <p className="font-medium text-gray-900">{record.visceralFatPercentage}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-gray-500">Estatura</span>
                          <p className="font-medium text-gray-900">{record.height} cm</p>
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
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalRecords.map(record => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.metabolicAge ?? "—"}
                        </td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            {record.status === "pending" && (
                              <button
                                onClick={() => handleConfirmBioimpedance(record.id)}
                                disabled={confirmingBioId === record.id}
                                className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                                title="Confirmar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingBioimpedance({ id: record.id, date: record.date });
                                setFormData({
                                  date: new Date(record.date).toISOString().split("T")[0],
                                  height: record.height?.toString() ?? "",
                                  weight: record.weight.toString(),
                                  imc: record.imc?.toString() ?? "",
                                  bodyFatPercentage: record.bodyFatPercentage?.toString() ?? "",
                                  muscleMassPercentage: record.muscleMassPercentage?.toString() ?? "",
                                  kcal: record.kcal?.toString() ?? "",
                                  metabolicAge: record.metabolicAge?.toString() ?? "",
                                  visceralFatPercentage: record.visceralFatPercentage?.toString() ?? "",
                                  notes: record.notes || "",
                                });
                                setShowBioModal(true);
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
                                setBioimpedanceToDelete({ id: record.id, date: formatLocalDate(record.date) });
                                setShowDeleteBioModal(true);
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
        </div>
      )}

      {activeTab === "pagos" && (
        <PaymentSection
          memberId={details.member.id}
          membershipPlan={membershipPlan}
          paymentStatus={paymentStatus}
          loading={paymentLoading}
          onRecordPayment={onRecordPayment}
          onUpdatePlan={onUpdatePlan}
          onUpdatePayment={onUpdatePayment}
          onDeletePayment={onDeletePayment}
        />
      )}

      {/* Bioimpedance Registration Modal */}
      <FormModal
        isOpen={showBioModal}
        onClose={() => {
          setShowBioModal(false);
          setEditingBioimpedance(null);
          setBioFormError("");
        }}
        title={editingBioimpedance ? "Editar Bioimpedancia" : "Registrar Bioimpedancia"}
        size="lg"
        onSubmit={handleSubmit}
        submitLabel={isSavingBio ? "Guardando..." : "Guardar Registro"}
        loading={isSavingBio}
        error={bioFormError}
        formClassName="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">IMC/BMI</label>
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
      </FormModal>

      <UpdateMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={onUpdateMember}
        member={details.member}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        memberName={member.name}
        defaultEmail={member.email}
        onInvite={async email => {
          await onInviteMember(email);
          setInviteFeedback(
            member.userId ? "Invitación reenviada correctamente." : "Invitación enviada correctamente."
          );
        }}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await onDeleteMember();
          setShowDeleteModal(false);
        }}
        title="Eliminar Deportista"
        message={`¿Estás seguro que deseas eliminar a ${member.name}? Esta acción no se puede deshacer.`}
        itemName={member.name}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteBioModal}
        onClose={() => {
          setShowDeleteBioModal(false);
          setBioimpedanceToDelete(null);
        }}
        onConfirm={handleDeleteBioimpedance}
        title="Eliminar Registro de Bioimpedancia"
        message="¿Estás seguro que deseas eliminar este registro de bioimpedancia? Esta acción no se puede deshacer."
        itemName={bioimpedanceToDelete ? `Registro del ${bioimpedanceToDelete.date}` : undefined}
        loading={isDeletingBio}
      />
    </div>
  );
}
