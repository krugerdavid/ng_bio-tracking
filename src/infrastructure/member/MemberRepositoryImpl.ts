import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import { Member, type CreateMemberDTO, type UpdateMemberDTO } from "@domain/member/entities/Member";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async create(data: CreateMemberDTO): Promise<Result<Member>> {
    try {
      // Get current authenticated user (optional check, just to ensure someone is logged in)
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !user) {
        return Result.error("User must be authenticated to create members");
      }

      const { data: member, error } = await this.supabase
        .from("members")
        .insert({
          // user_id is no longer required/linked
          name: data.name,
          document_number: data.documentNumber,
          email: data.email || null,
          date_of_birth: data.dateOfBirth ? this.formatDate(data.dateOfBirth) : null,
          gender: data.gender || null,
        })
        .select()
        .single();

      if (error) {
        return Result.error(`Error creating member: ${error.message}`);
      }

      return Result.success(this.mapToMember(member));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error creating member");
    }
  }

  async findById(id: string): Promise<Result<Member | null>> {
    try {
      const { data: member, error } = await this.supabase.from("members").select("*").eq("id", id).single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null); // Not found
        }
        return Result.error(`Error finding member: ${error.message}`);
      }

      return Result.success(member ? this.mapToMember(member) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding member");
    }
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Result<{ members: Member[]; total: number }>> {
    try {
      let query = this.supabase
        .from("members")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,document_number.ilike.%${options.search}%`);
      }

      if (options?.page && options?.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data: members, error, count } = await query;

      if (error) {
        return Result.error(`Error fetching members: ${error.message}`);
      }

      return Result.success({
        members: members.map(m => this.mapToMember(m)),
        total: count || 0,
      });
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching members");
    }
  }

  async update(id: string, data: UpdateMemberDTO): Promise<Result<Member>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.documentNumber !== undefined) updateData.document_number = data.documentNumber;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.dateOfBirth !== undefined)
        updateData.date_of_birth = data.dateOfBirth ? this.formatDate(data.dateOfBirth) : null;
      if (data.gender !== undefined) updateData.gender = data.gender;

      const { data: member, error } = await this.supabase
        .from("members")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Result.error(`Error updating member: ${error.message}`);
      }

      return Result.success(this.mapToMember(member));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error updating member");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.from("members").delete().eq("id", id);

      if (error) {
        return Result.error(`Error deleting member: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error deleting member");
    }
  }

  private mapToMember(data: {
    id: string;
    user_id?: string | null;
    name: string;
    document_number: string;
    email: string | null;
    date_of_birth: string | null;
    gender: string | null;
    created_at: string;
    updated_at: string;
  }): Member {
    return new Member(
      data.id,
      data.name,
      data.document_number,
      data.email || undefined,
      data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      (data.gender as "male" | "female" | "other") || undefined,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.user_id || undefined
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
