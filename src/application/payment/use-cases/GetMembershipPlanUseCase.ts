import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { MembershipPlan } from "@domain/payment/entities/MembershipPlan";

@injectable()
export class GetMembershipPlanUseCase {
  constructor(
    @inject(TYPES.MembershipPlanRepository)
    private membershipPlanRepository: MembershipPlanRepository
  ) {}

  async execute(memberId: string): Promise<Result<MembershipPlan | null>> {
    try {
      const result = await this.membershipPlanRepository.findByMemberId(memberId);

      if (result.isError()) {
        return Result.error(result.getError());
      }

      return Result.success(result.getValue());
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching membership plan");
    }
  }
}
