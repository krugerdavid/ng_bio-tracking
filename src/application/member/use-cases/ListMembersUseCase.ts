import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import { PaymentDomainService } from "@domain/payment/PaymentDomainService";
import type { MemberListItemDTO } from "../dtos/MemberListItemDTO";
import { TYPES } from "@core/container/DIContainer";
import { formatWithThousandsSeparator } from "@presentation/shared/utils/formatters";

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
    const memberIds = members.map(m => m.id);

    // Fetch all plans and payments in parallel
    const [plansResult, paymentsResult] = await Promise.all([
      this.membershipPlanRepository.findAllByMemberIds(memberIds),
      this.paymentRepository.findAllByMemberIds(memberIds),
    ]);

    const allPlans = plansResult.isSuccess() ? plansResult.getValue() : [];
    const allPayments = paymentsResult.isSuccess() ? paymentsResult.getValue() : [];

    // Create maps for O(1) access
    const plansMap = new Map(allPlans.map(p => [p.memberId, p]));
    const paymentsMap = new Map<string, typeof allPayments>();

    allPayments.forEach(p => {
      if (!paymentsMap.has(p.memberId)) {
        paymentsMap.set(p.memberId, []);
      }
      paymentsMap.get(p.memberId)?.push(p);
    });

    const items = members.map(member => {
      const plan = plansMap.get(member.id);
      const payments = paymentsMap.get(member.id) || [];

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
        documentNumber: formatWithThousandsSeparator(member.documentNumber),
        email: member.email || "", // Handle undefined email
        age: member.age,
        frequency,
        status,
        avatarUrl: undefined,
      };
    });

    return Result.success({ items, total });
  }
}
