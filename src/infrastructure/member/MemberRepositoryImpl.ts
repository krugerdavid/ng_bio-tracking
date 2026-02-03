import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import { Member, type CreateMemberDTO, type UpdateMemberDTO } from "@domain/member/entities/Member";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface MemberApi {
  id: string;
  name: string;
  document_number: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  user_id?: string | null;
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
    api.user_id ?? undefined
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
  }): Promise<Result<{ members: Member[]; total: number }>> {
    try {
      const params: Record<string, unknown> = {};
      if (options?.search) params.search = options.search;
      if (options?.limit !== undefined && options?.limit !== null) params.page_size = options.limit;
      if (options?.page !== undefined && options?.page !== null) params.page = options.page;
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

  async update(id: string, data: UpdateMemberDTO): Promise<Result<Member>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.documentNumber !== undefined) body.document_number = data.documentNumber;
      if (data.email !== undefined) body.email = data.email;
      if (data.dateOfBirth !== undefined) body.date_of_birth = data.dateOfBirth ? formatDate(data.dateOfBirth) : null;
      if (data.gender !== undefined) body.gender = data.gender;
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
}
