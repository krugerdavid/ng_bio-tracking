export interface Bioimpedance {
  id: string;
  memberId: string;
  date: Date;
  weight: number; // peso en kg
  height?: number; // altura en cm
  imc?: number; // Índice de Masa Corporal
  bodyFatPercentage?: number; // % de grasa
  muscleMassPercentage?: number; // % de musculo
  kcal?: number; // calorías
  metabolicAge?: number; // Edad Metabolica
  visceralFatPercentage?: number; // % grasa visceral
  notes?: string;
  /** Alumno cargó su propio peso (pending) vs. medición del profe/confirmada. */
  status?: "pending" | "confirmed";
  createdAt: Date;
}

export type CreateBioimpedanceDTO = Omit<Bioimpedance, "id" | "createdAt" | "status">;
export type UpdateBioimpedanceDTO = Partial<Omit<CreateBioimpedanceDTO, "memberId">> & {
  status?: "pending" | "confirmed";
};
