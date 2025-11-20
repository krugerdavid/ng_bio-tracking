export interface Bioimpedance {
    id: string;
    memberId: string;
    date: Date;
    weight: number; // in kg
    bodyFatPercentage: number; // percentage
    muscleMassPercentage: number; // percentage
    waterPercentage: number; // percentage
    bmi: number;
    visceralFat: number; // level 1-59
    boneMass: number; // in kg
    basalMetabolicRate: number; // kcal/day
    notes?: string;
    createdAt: Date;
}

export type CreateBioimpedanceDTO = Omit<Bioimpedance, 'id' | 'createdAt'>;

