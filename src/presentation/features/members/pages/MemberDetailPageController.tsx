import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMemberDetailsUseCase, MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";
import type { CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { RecordPaymentUseCase } from "@application/payment/use-cases/RecordPaymentUseCase";
import type {
  GetPaymentStatusUseCase,
  PaymentStatusResult,
} from "@application/payment/use-cases/GetPaymentStatusUseCase";
import type { GetMembershipPlanUseCase } from "@application/payment/use-cases/GetMembershipPlanUseCase";
import type { UpdateMembershipPlanUseCase } from "@application/payment/use-cases/UpdateMembershipPlanUseCase";
import type { CreatePaymentDTO } from "@domain/payment/entities/Payment";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import { MemberDetailPage } from "./MemberDetailPage";

export default function MemberDetailPageController() {
  const { memberId } = useParams<{ memberId: string }>();
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<MembershipPlan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getMemberDetailsUseCase = container.get<GetMemberDetailsUseCase>(TYPES.GetMemberDetailsUseCase);
  const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);
  const recordPaymentUseCase = container.get<RecordPaymentUseCase>(TYPES.RecordPaymentUseCase);
  const getPaymentStatusUseCase = container.get<GetPaymentStatusUseCase>(TYPES.GetPaymentStatusUseCase);
  const getMembershipPlanUseCase = container.get<GetMembershipPlanUseCase>(TYPES.GetMembershipPlanUseCase);
  const updateMembershipPlanUseCase = container.get<UpdateMembershipPlanUseCase>(TYPES.UpdateMembershipPlanUseCase);

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
    />
  );
}
