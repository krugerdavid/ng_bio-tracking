import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMemberDetailsUseCase, MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";
import type { UpdateBioimpedanceUseCase } from "@application/bioimpedance/use-cases/UpdateBioimpedanceUseCase";
import type { DeleteBioimpedanceUseCase } from "@application/bioimpedance/use-cases/DeleteBioimpedanceUseCase";
import type { CreateBioimpedanceDTO, UpdateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { RecordPaymentUseCase } from "@application/payment/use-cases/RecordPaymentUseCase";
import type { UpdatePaymentUseCase } from "@application/payment/use-cases/UpdatePaymentUseCase";
import type { DeletePaymentUseCase } from "@application/payment/use-cases/DeletePaymentUseCase";
import type { UpdatePaymentDTO } from "@domain/payment/entities/Payment";
import type {
  GetPaymentStatusUseCase,
  PaymentStatusResult,
} from "@application/payment/use-cases/GetPaymentStatusUseCase";
import type { GetMembershipPlanUseCase } from "@application/payment/use-cases/GetMembershipPlanUseCase";
import type { UpdateMembershipPlanUseCase } from "@application/payment/use-cases/UpdateMembershipPlanUseCase";
import type { CreatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import { MemberDetailPage } from "./MemberDetailPage";

import type { DeleteMemberUseCase } from "@application/member/use-cases/DeleteMemberUseCase";
import type { InviteMemberUseCase } from "@application/member/use-cases/InviteMemberUseCase";

export default function MemberDetailPageController() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<MembershipPlan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getMemberDetailsUseCase = container.get<GetMemberDetailsUseCase>(TYPES.GetMemberDetailsUseCase);
  const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);
  const updateBioimpedanceUseCase = container.get<UpdateBioimpedanceUseCase>(TYPES.UpdateBioimpedanceUseCase);
  const deleteBioimpedanceUseCase = container.get<DeleteBioimpedanceUseCase>(TYPES.DeleteBioimpedanceUseCase);
  const recordPaymentUseCase = container.get<RecordPaymentUseCase>(TYPES.RecordPaymentUseCase);
  const updatePaymentUseCase = container.get<UpdatePaymentUseCase>(TYPES.UpdatePaymentUseCase);
  const deletePaymentUseCase = container.get<DeletePaymentUseCase>(TYPES.DeletePaymentUseCase);
  const getPaymentStatusUseCase = container.get<GetPaymentStatusUseCase>(TYPES.GetPaymentStatusUseCase);
  const getMembershipPlanUseCase = container.get<GetMembershipPlanUseCase>(TYPES.GetMembershipPlanUseCase);
  const updateMembershipPlanUseCase = container.get<UpdateMembershipPlanUseCase>(TYPES.UpdateMembershipPlanUseCase);
  const deleteMemberUseCase = container.get<DeleteMemberUseCase>(TYPES.DeleteMemberUseCase);
  const inviteMemberUseCase = container.get<InviteMemberUseCase>(TYPES.InviteMemberUseCase);

  const fetchPaymentData = async () => {
    if (!memberId) return;
    setPaymentLoading(true);
    const [planResult, statusResult] = await Promise.all([
      getMembershipPlanUseCase.execute(memberId),
      getPaymentStatusUseCase.execute(memberId),
    ]);

    if (planResult.isSuccess()) setMembershipPlan(planResult.getValue());
    if (statusResult.isSuccess()) setPaymentStatus(statusResult.getValue());
    setPaymentLoading(false);
  };

  const fetchDetails = async () => {
    if (!memberId) return;
    setLoading(true);
    const result = await getMemberDetailsUseCase.execute(memberId);
    if (result.isError()) {
      setError(result.getError());
    } else {
      setDetails(result.getValue());
    }
    setLoading(false);
  };

  const loadAllData = async () => {
    if (!memberId) return;
    setLoading(true);
    setPaymentLoading(true);
    setError("");

    await Promise.all([fetchDetails(), fetchPaymentData()]);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const handleSubmit = async (bioData: CreateBioimpedanceDTO) => {
    if (!memberId) return;

    const result = await recordBioimpedanceUseCase.execute(bioData);

    if (result.isError()) {
      console.error("Error recording bioimpedance:", result.getError());
      throw new Error(result.getError());
    } else {
      await fetchDetails();
    }
  };

  const handleRecordPayment = async (payment: CreatePaymentDTO) => {
    const result = await recordPaymentUseCase.execute(payment);

    if (result.isError()) {
      console.error("Error recording payment:", result.getError());
      alert("Error al registrar el pago: " + result.getError());
    } else {
      await fetchPaymentData();
    }
  };

  const handleUpdatePlan = async (planData: {
    monthlyFee: number;
    weeklyFrequency: number;
    startDate: Date;
    isActive: boolean;
  }) => {
    if (!memberId) return;

    const result = await updateMembershipPlanUseCase.execute({
      memberId,
      ...planData,
    });

    if (result.isError()) {
      console.error("Error updating membership plan:", result.getError());
      alert("Error al actualizar el plan: " + result.getError());
    } else {
      await fetchPaymentData();
    }
  };

  const handleUpdateMember = async () => {
    await fetchDetails();
  };

  const handleDeleteMember = async () => {
    if (!memberId) return;

    const result = await deleteMemberUseCase.execute(memberId);

    if (result.isError()) {
      throw new Error(result.getError());
    } else {
      navigate("/members");
    }
  };

  const handleInviteMember = async (email?: string) => {
    if (!memberId) return;

    const result = await inviteMemberUseCase.execute(memberId, email);
    if (result.isError()) {
      throw new Error(result.getError());
    }
    await fetchDetails();
  };

  const handleUpdateBioimpedance = async (id: string, data: UpdateBioimpedanceDTO) => {
    const result = await updateBioimpedanceUseCase.execute(id, data);

    if (result.isError()) {
      console.error("Error updating bioimpedance:", result.getError());
      throw new Error(result.getError());
    } else {
      await fetchDetails();
    }
  };

  const handleDeleteBioimpedance = async (id: string) => {
    const result = await deleteBioimpedanceUseCase.execute(id);

    if (result.isError()) {
      console.error("Error deleting bioimpedance:", result.getError());
      throw new Error(result.getError());
    } else {
      await fetchDetails();
    }
  };

  const handleUpdatePayment = async (id: string, data: UpdatePaymentDTO) => {
    const result = await updatePaymentUseCase.execute(id, data);

    if (result.isError()) {
      console.error("Error updating payment:", result.getError());
      alert("Error al actualizar el pago: " + result.getError());
    } else {
      await fetchPaymentData();
    }
  };

  const handleDeletePayment = async (id: string) => {
    const result = await deletePaymentUseCase.execute(id);

    if (result.isError()) {
      console.error("Error deleting payment:", result.getError());
      alert("Error al eliminar el pago: " + result.getError());
    } else {
      await fetchPaymentData();
    }
  };

  return (
    <MemberDetailPage
      details={details}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      membershipPlan={membershipPlan}
      paymentStatus={paymentStatus}
      paymentLoading={paymentLoading}
      onRecordPayment={handleRecordPayment}
      onUpdatePlan={handleUpdatePlan}
      onUpdateMember={handleUpdateMember}
      onDeleteMember={handleDeleteMember}
      onInviteMember={handleInviteMember}
      onUpdateBioimpedance={handleUpdateBioimpedance}
      onDeleteBioimpedance={handleDeleteBioimpedance}
      onUpdatePayment={handleUpdatePayment}
      onDeletePayment={handleDeletePayment}
    />
  );
}
