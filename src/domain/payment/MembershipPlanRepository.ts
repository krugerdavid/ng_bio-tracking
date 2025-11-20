import type { Result } from "@core/types/Result";
import type { MembershipPlan, CreateMembershipPlanDTO, UpdateMembershipPlanDTO } from "./entities/MembershipPlan";

export interface MembershipPlanRepository {
  create(data: CreateMembershipPlanDTO): Promise<Result<MembershipPlan>>;
  findById(id: string): Promise<Result<MembershipPlan | null>>;
  findByMemberId(memberId: string): Promise<Result<MembershipPlan | null>>;
  update(id: string, data: UpdateMembershipPlanDTO): Promise<Result<MembershipPlan>>;
  delete(id: string): Promise<Result<void>>;
}
