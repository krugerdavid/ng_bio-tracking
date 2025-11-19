import type { Bioimpedance, CreateBioimpedanceDTO } from '../../domain/entities/Bioimpedance';
import type { IBioimpedanceRepository } from '../../domain/repositories/IBioimpedanceRepository';
import { supabase } from '../supabase/client';

export class SupabaseBioimpedanceRepository implements IBioimpedanceRepository {
    async create(data: CreateBioimpedanceDTO): Promise<Bioimpedance> {
        const { data: bioimpedance, error } = await supabase
            .from('bioimpedances')
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
            throw new Error(`Error creating bioimpedance: ${error.message}`);
        }

        return this.mapToBioimpedance(bioimpedance);
    }

    async findById(id: string): Promise<Bioimpedance | null> {
        const { data: bioimpedance, error } = await supabase
            .from('bioimpedances')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding bioimpedance: ${error.message}`);
        }

        return bioimpedance ? this.mapToBioimpedance(bioimpedance) : null;
    }

    async findByMemberId(memberId: string): Promise<Bioimpedance[]> {
        const { data: bioimpedances, error } = await supabase
            .from('bioimpedances')
            .select('*')
            .eq('member_id', memberId)
            .order('date', { ascending: false });

        if (error) {
            throw new Error(`Error fetching bioimpedances: ${error.message}`);
        }

        return bioimpedances.map(b => this.mapToBioimpedance(b));
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('bioimpedances')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting bioimpedance: ${error.message}`);
        }
    }

    private mapToBioimpedance(data: any): Bioimpedance {
        return {
            id: data.id,
            memberId: data.member_id,
            date: new Date(data.date),
            weight: parseFloat(data.weight),
            bodyFatPercentage: parseFloat(data.body_fat_percentage),
            muscleMassPercentage: parseFloat(data.muscle_mass_percentage),
            waterPercentage: parseFloat(data.water_percentage),
            bmi: parseFloat(data.bmi),
            visceralFat: data.visceral_fat,
            boneMass: parseFloat(data.bone_mass),
            basalMetabolicRate: data.basal_metabolic_rate,
            notes: data.notes,
            createdAt: new Date(data.created_at),
        };
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
