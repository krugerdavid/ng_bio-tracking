import { useEffect, useState } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMyMemberUseCase } from "@application/member/use-cases/GetMyMemberUseCase";
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const detailsResult = await getMyMemberUseCase.execute(memberId);
      if (cancelled) return;

      if (detailsResult.isError()) {
        setError(detailsResult.getError());
        setLoading(false);
        return;
      }

      const { member, bioimpedances } = detailsResult.getValue();
      setMember(member);
      setBioimpedances(bioimpedances);

      const paymentResult = await getPaymentStatusUseCase.execute(member.id);
      if (cancelled) return;
      if (paymentResult.isSuccess()) {
        setPaymentStatus(paymentResult.getValue());
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  return (
    <MemberHomePage
      member={member}
      bioimpedances={bioimpedances}
      paymentStatus={paymentStatus}
      loading={loading}
      error={error}
    />
  );
}
