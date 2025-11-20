import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type {
  MembershipPlan,
  CreateMembershipPlanDTO,
  UpdateMembershipPlanDTO,
} from "@domain/payment/entities/MembershipPlan";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class MembershipPlanRepositoryImpl implements MembershipPlanRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async create(data: CreateMembershipPlanDTO): Promise<Result<MembershipPlan>> {
    try {
      const { data: plan, error } = await this.supabase
        .from("membership_plans")
        .insert({
          member_id: data.memberId,
          monthly_fee: data.monthlyFee,
          weekly_frequency: data.weeklyFrequency,
          start_date: this.formatDate(data.startDate),
          is_active: data.isActive,
        })
        .select()
        .single();

      if (error) {
        return Result.error(`Error creating membership plan: ${error.message}`);
      }

      return Result.success(this.mapToMembershipPlan(plan));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error creating membership plan");
    }
  }

  async findById(id: string): Promise<Result<MembershipPlan | null>> {
    try {
      const { data: plan, error } = await this.supabase.from("membership_plans").select("*").eq("id", id).single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null);
        }
        return Result.error(`Error finding membership plan: ${error.message}`);
      }

      return Result.success(plan ? this.mapToMembershipPlan(plan) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding membership plan");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<MembershipPlan | null>> {
    try {
      const { data: plan, error } = await this.supabase
        .from("membership_plans")
        .select("*")
        .eq("member_id", memberId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null);
        }
        return Result.error(`Error finding membership plan: ${error.message}`);
      }

      return Result.success(plan ? this.mapToMembershipPlan(plan) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding membership plan");
    }
  }

  async update(id: string, data: UpdateMembershipPlanDTO): Promise<Result<MembershipPlan>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.monthlyFee !== undefined) updateData.monthly_fee = data.monthlyFee;
      if (data.weeklyFrequency !== undefined) updateData.weekly_frequency = data.weeklyFrequency;
      if (data.startDate !== undefined) updateData.start_date = this.formatDate(data.startDate);
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { data: plan, error } = await this.supabase
        .from("membership_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Result.error(`Error updating membership plan: ${error.message}`);
      }

      return Result.success(this.mapToMembershipPlan(plan));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error updating membership plan");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.from("membership_plans").delete().eq("id", id);

      if (error) {
        return Result.error(`Error deleting membership plan: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error deleting membership plan");
    }
  }

  private mapToMembershipPlan(data: {
    id: string;
    member_id: string;
    monthly_fee: number | string;
    weekly_frequency: number;
    start_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }): MembershipPlan {
    return {
      id: data.id,
      memberId: data.member_id,
      monthlyFee: parseFloat(String(data.monthly_fee)),
      weeklyFrequency: data.weekly_frequency,
      startDate: this.parseDateString(data.start_date),
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private parseDateString(dateString: string): Date {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
