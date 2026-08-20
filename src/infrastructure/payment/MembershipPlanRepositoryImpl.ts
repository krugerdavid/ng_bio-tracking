import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type {
  MembershipPlan,
  CreateMembershipPlanDTO,
  UpdateMembershipPlanDTO,
} from "@domain/payment/entities/MembershipPlan";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface MembershipPlanApi {
  id: string;
  member_id: string;
  monthly_fee: number;
  weekly_frequency: number;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapPlanApiToEntity(api: MembershipPlanApi): MembershipPlan {
  return {
    id: api.id,
    memberId: api.member_id,
    monthlyFee: Number(api.monthly_fee),
    weeklyFrequency: api.weekly_frequency,
    startDate: parseDate(api.start_date),
    isActive: api.is_active,
    createdAt: new Date(api.created_at),
    updatedAt: new Date(api.updated_at),
  };
}

function parseDate(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2] ? parseInt(parts[2], 10) : 1;
    return new Date(year, month, day);
  }
  return new Date(dateString);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

@injectable()
export class MembershipPlanRepositoryImpl implements MembershipPlanRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async create(data: CreateMembershipPlanDTO): Promise<Result<MembershipPlan>> {
    try {
      const payload = await this.http.post<MembershipPlanApi>("/plans", {
        member_id: data.memberId,
        monthly_fee: data.monthlyFee,
        weekly_frequency: data.weeklyFrequency,
        start_date: formatDate(data.startDate),
        is_active: data.isActive ?? true,
      });
      return Result.success(mapPlanApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error creating plan");
    }
  }

  async findById(id: string): Promise<Result<MembershipPlan | null>> {
    try {
      const payload = await this.http.get<MembershipPlanApi>(`/plans/${id}`);
      return Result.success(mapPlanApiToEntity(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error finding plan");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<MembershipPlan | null>> {
    try {
      const payload = await this.http.get<MembershipPlanApi>(`/members/${memberId}/plan`);
      return Result.success(mapPlanApiToEntity(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error fetching plan");
    }
  }

  async findAllByMemberIds(memberIds: string[]): Promise<Result<MembershipPlan[]>> {
    if (memberIds.length === 0) {
      return Result.success([]);
    }
    try {
      // Single batched request (backend precarga planes y pagos) en vez de un
      // GET /members/{id}/plan por cada miembro — evita el patrón N+1 que
      // se nota a partir de una docena de miembros en el dashboard y la lista.
      const payload = await this.http.post<{ member_id: string; plan: MembershipPlanApi | null }[]>(
        "/reports/member-summaries",
        { member_ids: memberIds }
      );
      const plans = payload.filter(item => item.plan !== null).map(item => mapPlanApiToEntity(item.plan!));
      return Result.success(plans);
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching plans");
    }
  }

  async update(id: string, data: UpdateMembershipPlanDTO): Promise<Result<MembershipPlan>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.monthlyFee !== undefined) body.monthly_fee = data.monthlyFee;
      if (data.weeklyFrequency !== undefined) body.weekly_frequency = data.weeklyFrequency;
      if (data.startDate !== undefined) body.start_date = formatDate(data.startDate);
      if (data.isActive !== undefined) body.is_active = data.isActive;
      const payload = await this.http.put<MembershipPlanApi>(`/plans/${id}`, body);
      return Result.success(mapPlanApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error updating plan");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    void id; // required by interface; API does not support delete
    return Result.error("Membership plan deletion not supported by API");
  }
}
