import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { CreateMembershipPlanDTO, MembershipPlan } from "@domain/payment/entities/MembershipPlan";
import { PaymentDomainService } from "@domain/payment/PaymentDomainService";

@injectable()
export class UpdateMembershipPlanUseCase {
  constructor(
    @inject(TYPES.MembershipPlanRepository)
    private membershipPlanRepository: MembershipPlanRepository
  ) {}

  async execute(data: CreateMembershipPlanDTO): Promise<Result<MembershipPlan>> {
    try {
      // Validate weekly frequency
      if (!PaymentDomainService.validateWeeklyFrequency(data.weeklyFrequency)) {
        return Result.error("Weekly frequency must be between 1 and 5");
      }

      // Validate monthly fee
      if (!PaymentDomainService.validateMonthlyFee(data.monthlyFee)) {
        return Result.error("Monthly fee must be greater than 0");
      }

      // Check if plan already exists for this member
      const existingPlanResult = await this.membershipPlanRepository.findByMemberId(data.memberId);

      if (existingPlanResult.isError()) {
        return Result.error(existingPlanResult.getError());
      }

      const existingPlan = existingPlanResult.getValue();

      // If plan exists, update it; otherwise create new one
      if (existingPlan) {
        const updateResult = await this.membershipPlanRepository.update(existingPlan.id, {
          monthlyFee: data.monthlyFee,
          weeklyFrequency: data.weeklyFrequency,
          startDate: data.startDate,
          isActive: data.isActive,
        });

        if (updateResult.isError()) {
          return Result.error(updateResult.getError());
        }

        return Result.success(updateResult.getValue());
      } else {
        // Create new plan
        const createResult = await this.membershipPlanRepository.create(data);

        if (createResult.isError()) {
          return Result.error(createResult.getError());
        }

        return Result.success(createResult.getValue());
      }
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error updating membership plan");
    }
  }
}
