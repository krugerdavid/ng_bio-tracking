import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { MemberRepository } from "@domain/member/MemberRepository";
import { PaymentDomainService } from "@domain/payment/PaymentDomainService";
import type { Payment } from "@domain/payment/entities/Payment";

export interface PaymentStatusResult {
  payments: Payment[];
  overdueMonths: string[];
  isOverdue: boolean;
  totalDebt: number;
}

@injectable()
export class GetPaymentStatusUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: PaymentRepository,
    @inject(TYPES.MembershipPlanRepository)
    private membershipPlanRepository: MembershipPlanRepository,
    @inject(TYPES.MemberRepository)
    private memberRepository: MemberRepository
  ) {}

  async execute(memberId: string): Promise<Result<PaymentStatusResult>> {
    try {
      const [paymentsResult, planResult, debtResult] = await Promise.all([
        this.paymentRepository.findByMemberId(memberId),
        this.membershipPlanRepository.findByMemberId(memberId),
        this.memberRepository.getDebtSummary(memberId),
      ]);

      if (paymentsResult.isError()) return Result.error(paymentsResult.getError());
      if (planResult.isError()) return Result.error(planResult.getError());

      const payments = paymentsResult.getValue();
      const plan = planResult.getValue();

      // Prefer backend debt summary (includes credit_balance / total_debt_after_credit)
      const debt = debtResult.isSuccess() ? debtResult.getValue() : null;
      if (debt !== null) {
        const totalDebt = debt.totalDebtAfterCredit;
        const isOverdue = totalDebt > 0;
        const overdueMonths = isOverdue ? debt.owedMonths : [];
        return Result.success({
          payments,
          overdueMonths,
          isOverdue,
          totalDebt,
        });
      }

      // Fallback: compute from plan + payments (no credit_balance)
      const overdueMonths = PaymentDomainService.getOverdueMonths(plan, payments);
      const totalDebt = plan && overdueMonths.length > 0 ? overdueMonths.length * plan.monthlyFee : 0;
      return Result.success({
        payments,
        overdueMonths,
        isOverdue: overdueMonths.length > 0,
        totalDebt,
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error getting payment status");
    }
  }
}
