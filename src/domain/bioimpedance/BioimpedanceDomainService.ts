import type { Bioimpedance } from './entities/Bioimpedance';

/**
 * Domain service for Bioimpedance business logic
 */
export class BioimpedanceDomainService {
    /**
     * Calculate BMI from weight and height
     * Note: This assumes height is needed, but we only have weight in the current model
     * For now, we validate that BMI is within reasonable range
     */
    validateBMI(bmi: number): boolean {
        return bmi >= 10 && bmi <= 60; // Reasonable BMI range
    }

    /**
     * Validate body fat percentage
     */
    validateBodyFatPercentage(percentage: number): boolean {
        return percentage >= 0 && percentage <= 100;
    }

    /**
     * Validate muscle mass percentage
     */
    validateMuscleMassPercentage(percentage: number): boolean {
        return percentage >= 0 && percentage <= 100;
    }

    /**
     * Validate water percentage
     */
    validateWaterPercentage(percentage: number): boolean {
        return percentage >= 0 && percentage <= 100;
    }

    /**
     * Validate visceral fat level
     */
    validateVisceralFat(level: number): boolean {
        return level >= 1 && level <= 59;
    }

    /**
     * Validate bioimpedance data
     */
    validateBioimpedance(bioimpedance: Partial<Bioimpedance>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (bioimpedance.weight !== undefined && (bioimpedance.weight <= 0 || bioimpedance.weight > 500)) {
            errors.push('Weight must be between 0 and 500 kg');
        }

        if (bioimpedance.bmi !== undefined && !this.validateBMI(bioimpedance.bmi)) {
            errors.push('BMI must be between 10 and 60');
        }

        if (bioimpedance.bodyFatPercentage !== undefined && !this.validateBodyFatPercentage(bioimpedance.bodyFatPercentage)) {
            errors.push('Body fat percentage must be between 0 and 100');
        }

        if (bioimpedance.muscleMassPercentage !== undefined && !this.validateMuscleMassPercentage(bioimpedance.muscleMassPercentage)) {
            errors.push('Muscle mass percentage must be between 0 and 100');
        }

        if (bioimpedance.waterPercentage !== undefined && !this.validateWaterPercentage(bioimpedance.waterPercentage)) {
            errors.push('Water percentage must be between 0 and 100');
        }

        if (bioimpedance.visceralFat !== undefined && !this.validateVisceralFat(bioimpedance.visceralFat)) {
            errors.push('Visceral fat must be between 1 and 59');
        }

        if (bioimpedance.boneMass !== undefined && (bioimpedance.boneMass <= 0 || bioimpedance.boneMass > 50)) {
            errors.push('Bone mass must be between 0 and 50 kg');
        }

        if (bioimpedance.basalMetabolicRate !== undefined && (bioimpedance.basalMetabolicRate <= 0 || bioimpedance.basalMetabolicRate > 10000)) {
            errors.push('Basal metabolic rate must be between 0 and 10000 kcal/day');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

