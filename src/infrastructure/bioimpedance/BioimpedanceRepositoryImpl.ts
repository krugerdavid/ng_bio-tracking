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
          height: data.height,
          weight: data.weight,
          imc: data.imc,
          body_fat_percentage: data.bodyFatPercentage,
          muscle_mass_percentage: data.muscleMassPercentage,
          kcal: data.kcal,
          metabolic_age: data.metabolicAge,
          visceral_fat_percentage: data.visceralFatPercentage,
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
    height: number | string;
    weight: number | string;
    imc: number | string;
    body_fat_percentage: number | string;
    muscle_mass_percentage: number | string;
    kcal: number | string;
    metabolic_age: number | string;
    visceral_fat_percentage: number | string;
    notes: string | null;
    created_at: string;
  }): Bioimpedance {
    return {
      id: data.id,
      memberId: data.member_id,
      date: new Date(data.date),
      height: parseFloat(String(data.height)),
      weight: parseFloat(String(data.weight)),
      imc: parseFloat(String(data.imc)),
      bodyFatPercentage: parseFloat(String(data.body_fat_percentage)),
      muscleMassPercentage: parseFloat(String(data.muscle_mass_percentage)),
      kcal: parseFloat(String(data.kcal)),
      metabolicAge: parseFloat(String(data.metabolic_age)),
      visceralFatPercentage: parseFloat(String(data.visceral_fat_percentage)),
      notes: data.notes ?? undefined,
      createdAt: new Date(data.created_at),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
