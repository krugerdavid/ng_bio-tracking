import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import { PaymentDomainService } from "@domain/payment/PaymentDomainService";
import type { MemberListItemDTO } from "../dtos/MemberListItemDTO";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class ListMembersUseCase {
  constructor(
    @inject(TYPES.MemberRepository) private memberRepository: MemberRepository,
    @inject(TYPES.MembershipPlanRepository) private membershipPlanRepository: MembershipPlanRepository,
    @inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository
  ) {}

  async execute(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Result<{ items: MemberListItemDTO[]; total: number }>> {
    const membersResult = await this.memberRepository.findAll(options);

    if (membersResult.isError()) {
      return Result.error(membersResult.getError());
    }

    const { members, total } = membersResult.getValue();

    const items = await Promise.all(
      members.map(async member => {
        // Fetch plan and payments in parallel
        const [planResult, paymentsResult] = await Promise.all([
          this.membershipPlanRepository.findByMemberId(member.id),
          this.paymentRepository.findByMemberId(member.id),
        ]);

        const plan = planResult.isSuccess() ? planResult.getValue() : null;
        const payments = paymentsResult.isSuccess() ? paymentsResult.getValue() : [];

        let status: "active" | "inactive" | "moroso" = "inactive";
        let frequency = "N/A";

        if (plan && plan.isActive) {
          frequency = `${plan.weeklyFrequency}x/semana`;

          const overdueMonths = PaymentDomainService.getOverdueMonths(plan, payments);
          if (overdueMonths.length > 0) {
            status = "moroso";
          } else {
            status = "active";
          }
        }

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          age: member.age,
          frequency,
          status,
          avatarUrl: undefined, // Could be added if we had it
        };
      })
    );

    return Result.success({ items, total });
  }
}
