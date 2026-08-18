import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import {
  Member,
  type CreateMemberDTO,
  type UpdateMemberDTO,
  type MemberUserStatus,
} from "@domain/member/entities/Member";
import type {
  MemberRepository,
  DebtSummary,
  EngagementSummary,
  DataQualitySummary,
} from "@domain/member/MemberRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface MemberApi {
  id: string;
  name: string;
  document_number: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  training_group?: string | null;
  user_id?: string | null;
  user_status?: string | null;
  created_at: string;
  updated_at: string;
}

interface MembersIndexPayload {
  data: MemberApi[];
  meta?: { total?: number };
}

function mapMemberApiToMember(api: MemberApi): Member {
  return new Member(
    api.id,
    api.name,
    api.document_number ?? "",
    api.email ?? undefined,
    api.date_of_birth ? new Date(api.date_of_birth) : undefined,
    (api.gender as "male" | "female" | "other") ?? undefined,
    new Date(api.created_at),
    new Date(api.updated_at),
    api.user_id !== null && api.user_id !== undefined && api.user_id !== "" ? String(api.user_id) : undefined,
    api.training_group ?? undefined,
    (api.user_status as MemberUserStatus) ?? undefined
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

@injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async create(data: CreateMemberDTO): Promise<Result<Member>> {
    try {
      const payload = await this.http.post<MemberApi>("/members", {
        name: data.name,
        document_number: data.documentNumber || null,
        email: data.email || null,
        date_of_birth: data.dateOfBirth ? formatDate(data.dateOfBirth) : null,
        gender: data.gender || null,
        training_group: data.trainingGroup || null,
      });
      return Result.success(mapMemberApiToMember(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error creating member");
    }
  }

  async findById(id: string): Promise<Result<Member | null>> {
    try {
      const payload = await this.http.get<MemberApi>(`/members/${id}`);
      return Result.success(mapMemberApiToMember(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error finding member");
    }
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    trainingGroup?: string;
    status?: "pending" | "active";
  }): Promise<Result<{ members: Member[]; total: number }>> {
    try {
      const params: Record<string, unknown> = {};
      if (options?.search) params.search = options.search;
      if (options?.limit !== undefined && options?.limit !== null) params.page_size = options.limit;
      if (options?.page !== undefined && options?.page !== null) params.page = options.page;
      if (options?.trainingGroup) params.training_group = options.trainingGroup;
      if (options?.status) params.status = options.status;
      const payload = await this.http.get<MembersIndexPayload>("/members", params);
      const list = Array.isArray(payload.data) ? payload.data : [];
      const total = payload.meta?.total ?? list.length;
      return Result.success({
        members: list.map(mapMemberApiToMember),
        total,
      });
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching members");
    }
  }

  async findLatest(limit: number): Promise<Result<Member[]>> {
    try {
      const params: Record<string, unknown> = { page: 1, page_size: Math.max(limit, 200) };
      const payload = await this.http.get<MembersIndexPayload>("/members", params);
      const list = Array.isArray(payload.data) ? payload.data : [];
      const members = list.map(mapMemberApiToMember);
      members.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return Result.success(members.slice(0, limit));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching latest members");
    }
  }

  async update(id: string, data: UpdateMemberDTO): Promise<Result<Member>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.documentNumber !== undefined) body.document_number = data.documentNumber;
      if (data.email !== undefined) body.email = data.email;
      if (data.dateOfBirth !== undefined) body.date_of_birth = data.dateOfBirth ? formatDate(data.dateOfBirth) : null;
      if (data.gender !== undefined) body.gender = data.gender;
      if (data.trainingGroup !== undefined) body.training_group = data.trainingGroup;
      const payload = await this.http.put<MemberApi>(`/members/${id}`, body);
      return Result.success(mapMemberApiToMember(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error updating member");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.http.delete(`/members/${id}`);
      return Result.success(undefined);
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error deleting member");
    }
  }

  async getDebtSummary(memberId: string): Promise<Result<DebtSummary | null>> {
    try {
      const payload = await this.http.get<{
        monthly_fee: number;
        owed_months: string[];
        total_debt: number;
        credit_balance: number;
        total_debt_after_credit: number;
      }>(`/members/${memberId}/debt`);
      return Result.success({
        monthlyFee: Number(payload.monthly_fee),
        owedMonths: Array.isArray(payload.owed_months) ? payload.owed_months : [],
        totalDebt: Number(payload.total_debt),
        creditBalance: Number(payload.credit_balance),
        totalDebtAfterCredit: Number(payload.total_debt_after_credit),
      });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error fetching debt summary");
    }
  }

  async getDebtSummaries(memberIds: string[]): Promise<Result<Map<string, DebtSummary>>> {
    if (memberIds.length === 0) {
      return Result.success(new Map());
    }
    const results = await Promise.all(memberIds.map(id => this.getDebtSummary(id)));
    const map = new Map<string, DebtSummary>();
    for (let i = 0; i < memberIds.length; i++) {
      const r = results[i];
      if (r.isSuccess() && r.getValue() !== null) {
        map.set(memberIds[i], r.getValue()!);
      }
    }
    return Result.success(map);
  }

  async invite(id: string, email?: string): Promise<Result<{ member: Member; message: string }>> {
    try {
      const body = email?.trim() ? { email: email.trim() } : {};
      const res = await this.http.request<MemberApi>("post", `/members/${id}/invite`, { data: body });
      return Result.success({
        member: mapMemberApiToMember(res.data),
        message: res.message ?? "Invitación enviada.",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const emailErr = err.errors?.email?.[0];
        return Result.error(emailErr ?? err.message);
      }
      return Result.error("Error al enviar la invitación");
    }
  }

  async approve(id: string): Promise<Result<{ member: Member; message: string }>> {
    try {
      const res = await this.http.request<MemberApi>("post", `/members/${id}/approve`, { data: {} });
      return Result.success({
        member: mapMemberApiToMember(res.data),
        message: res.message ?? "Registro aprobado.",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const memberErr = err.errors?.member?.[0];
        return Result.error(memberErr ?? err.message);
      }
      return Result.error("Error al aprobar el registro");
    }
  }

  async getEngagementSummary(): Promise<Result<EngagementSummary>> {
    try {
      const payload = await this.http.get<{
        never_logged_in_count: number;
        never_logged_in: { id: string; name: string; email: string | null; training_group: string | null }[];
      }>("/reports/engagement");
      return Result.success({
        neverLoggedInCount: payload.never_logged_in_count,
        neverLoggedIn: payload.never_logged_in.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email ?? undefined,
          trainingGroup: m.training_group ?? undefined,
        })),
      });
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching engagement summary");
    }
  }

  async getDataQualitySummary(): Promise<Result<DataQualitySummary>> {
    try {
      const payload = await this.http.get<{
        incomplete_count: number;
        incomplete: {
          id: string;
          name: string;
          training_group: string | null;
          missing_plan: boolean;
          missing_email: boolean;
        }[];
      }>("/reports/data-quality");
      return Result.success({
        incompleteCount: payload.incomplete_count,
        incomplete: payload.incomplete.map(m => ({
          id: m.id,
          name: m.name,
          trainingGroup: m.training_group ?? undefined,
          missingPlan: m.missing_plan,
          missingEmail: m.missing_email,
        })),
      });
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching data quality summary");
    }
  }
}
