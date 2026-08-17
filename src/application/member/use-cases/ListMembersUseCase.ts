import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { MemberListItemDTO } from "../dtos/MemberListItemDTO";
import { TYPES } from "@core/container/DIContainer";
import { formatWithThousandsSeparator } from "@presentation/shared/utils/formatters";

@injectable()
export class ListMembersUseCase {
  constructor(
    @inject(TYPES.MemberRepository) private memberRepository: MemberRepository,
    @inject(TYPES.MembershipPlanRepository) private membershipPlanRepository: MembershipPlanRepository
  ) {}

  async execute(options?: {
    page?: number;
    limit?: number;
    search?: string;
    trainingGroup?: string;
    status?: "pending" | "active";
  }): Promise<Result<{ items: MemberListItemDTO[]; total: number }>> {
    const membersResult = await this.memberRepository.findAll(options);

    if (membersResult.isError()) {
      return Result.error(membersResult.getError());
    }

    const { members, total } = membersResult.getValue();
    const memberIds = members.map(m => m.id);

    // Fetch all plans and debt summaries in parallel
    const [plansResult, debtsResult] = await Promise.all([
      this.membershipPlanRepository.findAllByMemberIds(memberIds),
      this.memberRepository.getDebtSummaries(memberIds),
    ]);

    const allPlans = plansResult.isSuccess() ? plansResult.getValue() : [];
    const debtsMap = debtsResult.isSuccess() ? debtsResult.getValue() : new Map();

    // Create map for O(1) access
    const plansMap = new Map(allPlans.map(p => [p.memberId, p]));

    const items = members.map(member => {
      const plan = plansMap.get(member.id);
      const debt = debtsMap.get(member.id);

      let status: "active" | "inactive" | "moroso" = "inactive";
      let frequency = "N/A";
      let debtAmount = 0;

      if (plan && plan.isActive) {
        frequency = `${plan.weeklyFrequency}x/semana`;

        // Use backend debt summary (considers credit_balance)
        if (debt) {
          debtAmount = debt.totalDebtAfterCredit;
          status = debtAmount > 0 ? "moroso" : "active";
        } else {
          status = "active";
        }
      }

      return {
        id: member.id,
        name: member.name,
        documentNumber: formatWithThousandsSeparator(member.documentNumber),
        email: member.email || "",
        age: member.age,
        frequency,
        status,
        debtAmount,
        avatarUrl: undefined,
        trainingGroup: member.trainingGroup,
        registrationStatus: member.userStatus,
      };
    });

    return Result.success({ items, total });
  }
}
