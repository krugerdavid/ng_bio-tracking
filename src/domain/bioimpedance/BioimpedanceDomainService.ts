import { injectable } from "inversify";
import type { Bioimpedance, CreateBioimpedanceDTO } from "./entities/Bioimpedance";

@injectable()
export class BioimpedanceDomainService {
  validateBioimpedanceData(data: Partial<CreateBioimpedanceDTO>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.height !== undefined && (data.height <= 0 || data.height > 300)) {
      errors.push("La estatura debe estar entre 0 y 300 cm");
    }

    if (data.weight !== undefined && (data.weight <= 0 || data.weight > 500)) {
      errors.push("El peso debe estar entre 0 y 500 kg");
    }

    if (data.imc !== undefined && (data.imc <= 0 || data.imc > 100)) {
      errors.push("El IMC debe estar entre 0 y 100");
    }

    if (data.bodyFatPercentage !== undefined && (data.bodyFatPercentage < 0 || data.bodyFatPercentage > 100)) {
      errors.push("El porcentaje de grasa corporal debe estar entre 0 y 100");
    }

    if (data.muscleMassPercentage !== undefined && (data.muscleMassPercentage < 0 || data.muscleMassPercentage > 100)) {
      errors.push("El porcentaje de masa muscular debe estar entre 0 y 100");
    }

    if (data.kcal !== undefined && (data.kcal <= 0 || data.kcal > 10000)) {
      errors.push("Las calorías deben estar entre 0 y 10000");
    }

    if (data.metabolicAge !== undefined && (data.metabolicAge <= 0 || data.metabolicAge > 150)) {
      errors.push("La edad metabólica debe estar entre 0 y 150 años");
    }

    if (
      data.visceralFatPercentage !== undefined &&
      (data.visceralFatPercentage < 0 || data.visceralFatPercentage > 100)
    ) {
      errors.push("El porcentaje de grasa visceral debe estar entre 0 y 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  calculateIMC(weight: number, height: number): number {
    if (height <= 0) {
      throw new Error("La estatura debe ser mayor a 0");
    }
    // Convertir estatura de cm a metros
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  }

  compareBioimpedances(
    current: Bioimpedance,
    previous: Bioimpedance
  ): {
    weightChange: number;
    bodyFatChange: number;
    muscleMassChange: number;
    imcChange: number;
  } {
    return {
      weightChange: current.weight - previous.weight,
      bodyFatChange: current.bodyFatPercentage - previous.bodyFatPercentage,
      muscleMassChange: current.muscleMassPercentage - previous.muscleMassPercentage,
      imcChange: current.imc - previous.imc,
    };
  }
}
