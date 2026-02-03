import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type {
  Bioimpedance,
  CreateBioimpedanceDTO,
  UpdateBioimpedanceDTO,
} from "@domain/bioimpedance/entities/Bioimpedance";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface BioimpedanceApi {
  id: string;
  member_id: string;
  date: string;
  height: number;
  weight: number;
  imc: number;
  body_fat_percentage: number;
  muscle_mass_percentage: number;
  kcal: number;
  metabolic_age: number;
  visceral_fat_percentage: number;
  notes: string | null;
  created_at: string;
}

function mapBioimpedanceApiToEntity(api: BioimpedanceApi): Bioimpedance {
  return {
    id: api.id,
    memberId: api.member_id,
    date: new Date(api.date),
    height: Number(api.height),
    weight: Number(api.weight),
    imc: Number(api.imc),
    bodyFatPercentage: Number(api.body_fat_percentage),
    muscleMassPercentage: Number(api.muscle_mass_percentage),
    kcal: Number(api.kcal),
    metabolicAge: Number(api.metabolic_age),
    visceralFatPercentage: Number(api.visceral_fat_percentage),
    notes: api.notes ?? undefined,
    createdAt: new Date(api.created_at),
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

@injectable()
export class BioimpedanceRepositoryImpl implements BioimpedanceRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async create(data: CreateBioimpedanceDTO): Promise<Result<Bioimpedance>> {
    try {
      const payload = await this.http.post<BioimpedanceApi>("/bioimpedances", {
        member_id: data.memberId,
        date: formatDate(data.date),
        height: data.height,
        weight: data.weight,
        imc: data.imc,
        body_fat_percentage: data.bodyFatPercentage,
        muscle_mass_percentage: data.muscleMassPercentage,
        kcal: data.kcal,
        metabolic_age: data.metabolicAge,
        visceral_fat_percentage: data.visceralFatPercentage,
        notes: data.notes ?? null,
      });
      return Result.success(mapBioimpedanceApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error creating bioimpedance");
    }
  }

  async findById(id: string): Promise<Result<Bioimpedance | null>> {
    try {
      const payload = await this.http.get<BioimpedanceApi>(`/bioimpedances/${id}`);
      return Result.success(mapBioimpedanceApiToEntity(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error finding bioimpedance");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Bioimpedance[]>> {
    try {
      const payload = await this.http.get<BioimpedanceApi[] | { data: BioimpedanceApi[] }>(
        `/members/${memberId}/bioimpedance`
      );
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);
      return Result.success(list.map(mapBioimpedanceApiToEntity));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching bioimpedances");
    }
  }

  async update(id: string, data: UpdateBioimpedanceDTO): Promise<Result<Bioimpedance>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.date !== undefined) body.date = formatDate(data.date);
      if (data.height !== undefined) body.height = data.height;
      if (data.weight !== undefined) body.weight = data.weight;
      if (data.imc !== undefined) body.imc = data.imc;
      if (data.bodyFatPercentage !== undefined) body.body_fat_percentage = data.bodyFatPercentage;
      if (data.muscleMassPercentage !== undefined) body.muscle_mass_percentage = data.muscleMassPercentage;
      if (data.kcal !== undefined) body.kcal = data.kcal;
      if (data.metabolicAge !== undefined) body.metabolic_age = data.metabolicAge;
      if (data.visceralFatPercentage !== undefined) body.visceral_fat_percentage = data.visceralFatPercentage;
      if (data.notes !== undefined) body.notes = data.notes;
      const payload = await this.http.put<BioimpedanceApi>(`/bioimpedances/${id}`, body);
      return Result.success(mapBioimpedanceApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error updating bioimpedance");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.http.delete(`/bioimpedances/${id}`);
      return Result.success(undefined);
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error deleting bioimpedance");
    }
  }
}
