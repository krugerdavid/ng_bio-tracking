import { useCallback, useEffect, useState } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMyMemberUseCase } from "@application/member/use-cases/GetMyMemberUseCase";
import type { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";
import type { UpdateBioimpedanceUseCase } from "@application/bioimpedance/use-cases/UpdateBioimpedanceUseCase";
import type { DeleteBioimpedanceUseCase } from "@application/bioimpedance/use-cases/DeleteBioimpedanceUseCase";
import type {
  GetPaymentStatusUseCase,
  PaymentStatusResult,
} from "@application/payment/use-cases/GetPaymentStatusUseCase";
import type { GetMembershipPlanUseCase } from "@application/payment/use-cases/GetMembershipPlanUseCase";
import type { Member } from "@domain/member/entities/Member";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { MemberHomePage, type RegisterBioimpedanceData } from "./MemberHomePage";

export default function MemberHomePageController() {
  const { authState } = useAuth();
  const memberId = authState.user?.memberId;

  const [member, setMember] = useState<Member | null>(null);
  const [bioimpedances, setBioimpedances] = useState<Bioimpedance[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<MembershipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMyMemberUseCase = container.get<GetMyMemberUseCase>(TYPES.GetMyMemberUseCase);
  const getPaymentStatusUseCase = container.get<GetPaymentStatusUseCase>(TYPES.GetPaymentStatusUseCase);
  const getMembershipPlanUseCase = container.get<GetMembershipPlanUseCase>(TYPES.GetMembershipPlanUseCase);
  const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);
  const updateBioimpedanceUseCase = container.get<UpdateBioimpedanceUseCase>(TYPES.UpdateBioimpedanceUseCase);
  const deleteBioimpedanceUseCase = container.get<DeleteBioimpedanceUseCase>(TYPES.DeleteBioimpedanceUseCase);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const detailsResult = await getMyMemberUseCase.execute(memberId);

    if (detailsResult.isError()) {
      setError(detailsResult.getError());
      setLoading(false);
      return;
    }

    const { member, bioimpedances } = detailsResult.getValue();
    setMember(member);
    setBioimpedances(bioimpedances);

    const [paymentResult, planResult] = await Promise.all([
      getPaymentStatusUseCase.execute(member.id),
      getMembershipPlanUseCase.execute(member.id),
    ]);
    if (paymentResult.isSuccess()) {
      setPaymentStatus(paymentResult.getValue());
    }
    if (planResult.isSuccess()) {
      setMembershipPlan(planResult.getValue());
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRegisterBioimpedance = async (data: RegisterBioimpedanceData) => {
    if (!member) return;

    const result = await recordBioimpedanceUseCase.execute({
      memberId: member.id,
      date: data.date,
      weight: data.weight,
      height: data.height,
      imc: data.imc,
      bodyFatPercentage: data.bodyFatPercentage,
      muscleMassPercentage: data.muscleMassPercentage,
      kcal: data.kcal,
      metabolicAge: data.metabolicAge,
      visceralFatPercentage: data.visceralFatPercentage,
      notes: data.notes,
    });

    if (result.isError()) {
      throw new Error(result.getError());
    }

    await load();
  };

  const handleUpdateBioimpedance = async (id: string, data: RegisterBioimpedanceData) => {
    const result = await updateBioimpedanceUseCase.execute(id, data);

    if (result.isError()) {
      throw new Error(result.getError());
    }

    await load();
  };

  const handleDeleteBioimpedance = async (id: string) => {
    const result = await deleteBioimpedanceUseCase.execute(id);

    if (result.isError()) {
      throw new Error(result.getError());
    }

    await load();
  };

  return (
    <MemberHomePage
      member={member}
      bioimpedances={bioimpedances}
      paymentStatus={paymentStatus}
      membershipPlan={membershipPlan}
      loading={loading}
      error={error}
      onRegisterBioimpedance={handleRegisterBioimpedance}
      onUpdateBioimpedance={handleUpdateBioimpedance}
      onDeleteBioimpedance={handleDeleteBioimpedance}
    />
  );
}
