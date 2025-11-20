import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
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
    private membershipPlanRepository: MembershipPlanRepository
  ) {}

  async execute(memberId: string): Promise<Result<PaymentStatusResult>> {
    try {
      // Get member's payments
      const paymentsResult = await this.paymentRepository.findByMemberId(memberId);
      if (paymentsResult.isError()) {
        return Result.error(paymentsResult.getError());
      }

      const payments = paymentsResult.getValue();

      // Get member's membership plan
      const planResult = await this.membershipPlanRepository.findByMemberId(memberId);
      if (planResult.isError()) {
        return Result.error(planResult.getError());
      }

      const plan = planResult.getValue();

      // Calculate overdue months
      const overdueMonths = PaymentDomainService.getOverdueMonths(plan, payments);

      // Calculate total debt (sum of overdue months * monthly fee)
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
