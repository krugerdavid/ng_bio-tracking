export interface Bioimpedance {
  id: string;
  memberId: string;
  date: Date;
  height: number; // altura en cm
  weight: number; // peso en kg
  imc: number; // Índice de Masa Corporal
  bodyFatPercentage: number; // % de grasa
  muscleMassPercentage: number; // % de musculo
  kcal: number; // calorías
  metabolicAge: number; // Edad Metabolica
  visceralFatPercentage: number; // % grasa visceral
  notes?: string;
  createdAt: Date;
}

export type CreateBioimpedanceDTO = Omit<Bioimpedance, "id" | "createdAt">;
