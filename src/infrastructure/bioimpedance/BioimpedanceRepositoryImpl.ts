import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { Bioimpedance, CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class BioimpedanceRepositoryImpl implements BioimpedanceRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async create(data: CreateBioimpedanceDTO): Promise<Result<Bioimpedance>> {
    try {
      const { data: bioimpedance, error } = await this.supabase
        .from("bioimpedances")
        .insert({
          member_id: data.memberId,
          date: this.formatDate(data.date),
          weight: data.weight,
          body_fat_percentage: data.bodyFatPercentage,
          muscle_mass_percentage: data.muscleMassPercentage,
          water_percentage: data.waterPercentage,
          bmi: data.bmi,
          visceral_fat: data.visceralFat,
          bone_mass: data.boneMass,
          basal_metabolic_rate: data.basalMetabolicRate,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) {
        return Result.error(`Error creating bioimpedance: ${error.message}`);
      }

      return Result.success(this.mapToBioimpedance(bioimpedance));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error creating bioimpedance");
    }
  }

  async findById(id: string): Promise<Result<Bioimpedance | null>> {
    try {
      const { data: bioimpedance, error } = await this.supabase.from("bioimpedances").select("*").eq("id", id).single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null);
        }
        return Result.error(`Error finding bioimpedance: ${error.message}`);
      }

      return Result.success(bioimpedance ? this.mapToBioimpedance(bioimpedance) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding bioimpedance");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Bioimpedance[]>> {
    try {
      const { data: bioimpedances, error } = await this.supabase
        .from("bioimpedances")
        .select("*")
        .eq("member_id", memberId)
        .order("date", { ascending: false });

      if (error) {
        return Result.error(`Error fetching bioimpedances: ${error.message}`);
      }

      return Result.success(bioimpedances.map(b => this.mapToBioimpedance(b)));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching bioimpedances");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.from("bioimpedances").delete().eq("id", id);

      if (error) {
        return Result.error(`Error deleting bioimpedance: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error deleting bioimpedance");
    }
  }

  private mapToBioimpedance(data: {
    id: string;
    member_id: string;
    date: string;
    weight: number | string;
    body_fat_percentage: number | string;
    muscle_mass_percentage: number | string;
    water_percentage: number | string;
    bmi: number | string;
    visceral_fat: number | string;
    bone_mass: number | string;
    basal_metabolic_rate: number;
    notes: string | null;
    created_at: string;
  }): Bioimpedance {
    return {
      id: data.id,
      memberId: data.member_id,
      date: new Date(data.date),
      weight: parseFloat(String(data.weight)),
      bodyFatPercentage: parseFloat(String(data.body_fat_percentage)),
      muscleMassPercentage: parseFloat(String(data.muscle_mass_percentage)),
      waterPercentage: parseFloat(String(data.water_percentage)),
      bmi: parseFloat(String(data.bmi)),
      visceralFat: typeof data.visceral_fat === "number" ? data.visceral_fat : parseFloat(String(data.visceral_fat)),
      boneMass: parseFloat(String(data.bone_mass)),
      basalMetabolicRate: data.basal_metabolic_rate,
      notes: data.notes ?? undefined,
      createdAt: new Date(data.created_at),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
