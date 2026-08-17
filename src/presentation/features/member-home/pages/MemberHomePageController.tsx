import { useCallback, useEffect, useState } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMyMemberUseCase } from "@application/member/use-cases/GetMyMemberUseCase";
import type { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";
import type {
  GetPaymentStatusUseCase,
  PaymentStatusResult,
} from "@application/payment/use-cases/GetPaymentStatusUseCase";
import type { Member } from "@domain/member/entities/Member";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { MemberHomePage } from "./MemberHomePage";

export default function MemberHomePageController() {
  const { authState } = useAuth();
  const memberId = authState.user?.memberId;

  const [member, setMember] = useState<Member | null>(null);
  const [bioimpedances, setBioimpedances] = useState<Bioimpedance[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMyMemberUseCase = container.get<GetMyMemberUseCase>(TYPES.GetMyMemberUseCase);
  const getPaymentStatusUseCase = container.get<GetPaymentStatusUseCase>(TYPES.GetPaymentStatusUseCase);
  const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);

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

    const paymentResult = await getPaymentStatusUseCase.execute(member.id);
    if (paymentResult.isSuccess()) {
      setPaymentStatus(paymentResult.getValue());
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRegisterWeight = async (data: { date: Date; weight: number; notes?: string }) => {
    if (!member) return;

    const result = await recordBioimpedanceUseCase.execute({
      memberId: member.id,
      date: data.date,
      weight: data.weight,
      notes: data.notes,
    });

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
      loading={loading}
      error={error}
      onRegisterWeight={handleRegisterWeight}
    />
  );
}
