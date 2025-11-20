export interface MembershipPlan {
  id: string;
  memberId: string;
  monthlyFee: number;
  weeklyFrequency: number; // 1-5 times per week
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateMembershipPlanDTO = Omit<MembershipPlan, "id" | "createdAt" | "updatedAt">;
export type UpdateMembershipPlanDTO = Partial<Omit<CreateMembershipPlanDTO, "memberId">>;
