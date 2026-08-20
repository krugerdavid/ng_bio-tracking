export type BiologicalSex = "male" | "female";

export type InterpretationTone = "low" | "normal" | "high" | "veryHigh" | "good";

export interface MetricInterpretation {
  label: string;
  tone: InterpretationTone;
  hint?: string;
}

export function isBiologicalSex(gender: string | undefined): gender is BiologicalSex {
  return gender === "male" || gender === "female";
}

/** OMS: inferior / normal / sobrepeso / obesidad. */
export function interpretIMC(imc: number | undefined): MetricInterpretation | null {
  if (imc === undefined || Number.isNaN(imc)) return null;

  if (imc < 18.5) {
    return { label: "Inferior", tone: "low", hint: "Peso inferior al normal (OMS)" };
  }
  if (imc < 25) {
    return { label: "Normal", tone: "normal", hint: "IMC en rango normal (OMS)" };
  }
  if (imc < 30) {
    return { label: "Sobrepeso", tone: "high", hint: "Sobrepeso (OMS)" };
  }
  return { label: "Obesidad", tone: "veryHigh", hint: "Obesidad (OMS)" };
}

type FatBand = { minAge: number; maxAge: number; low: number; high: number; veryHigh: number };

const BODY_FAT_BANDS: Record<BiologicalSex, FatBand[]> = {
  female: [
    { minAge: 20, maxAge: 39, low: 21.0, high: 33.0, veryHigh: 39.0 },
    { minAge: 40, maxAge: 59, low: 23.0, high: 34.0, veryHigh: 40.0 },
    { minAge: 60, maxAge: 79, low: 24.0, high: 36.0, veryHigh: 42.0 },
  ],
  male: [
    { minAge: 20, maxAge: 39, low: 8.0, high: 20.0, veryHigh: 25.0 },
    { minAge: 40, maxAge: 59, low: 11.0, high: 22.0, veryHigh: 28.0 },
    { minAge: 60, maxAge: 79, low: 13.0, high: 25.0, veryHigh: 30.0 },
  ],
};

/** Grasa corporal según sexo y edad (NIH/WHO · Gallagher et al. 2000). */
export function interpretBodyFat(
  percentage: number | undefined,
  age: number | undefined,
  gender: string | undefined
): MetricInterpretation | null {
  if (percentage === undefined || Number.isNaN(percentage) || !age || !isBiologicalSex(gender)) return null;

  const band = BODY_FAT_BANDS[gender].find(b => age >= b.minAge && age <= b.maxAge);
  if (!band) return null;

  if (percentage < band.low) {
    return { label: "Bajo", tone: "low", hint: "Grasa corporal baja para sexo y edad" };
  }
  if (percentage < band.high) {
    return { label: "Normal", tone: "normal", hint: "Grasa corporal en rango normal" };
  }
  if (percentage < band.veryHigh) {
    return { label: "Alto", tone: "high", hint: "Grasa corporal alta" };
  }
  return { label: "Muy alto", tone: "veryHigh", hint: "Grasa corporal muy alta" };
}

type MuscleBand = { minAge: number; maxAge: number; low: number; high: number; veryHigh: number };

const SKELETAL_MUSCLE_BANDS: Record<BiologicalSex, MuscleBand[]> = {
  female: [
    { minAge: 18, maxAge: 39, low: 24.3, high: 30.4, veryHigh: 35.4 },
    { minAge: 40, maxAge: 59, low: 24.1, high: 30.2, veryHigh: 35.2 },
    { minAge: 60, maxAge: 80, low: 23.9, high: 30.0, veryHigh: 35.0 },
  ],
  male: [
    { minAge: 18, maxAge: 39, low: 33.3, high: 39.4, veryHigh: 44.1 },
    { minAge: 40, maxAge: 59, low: 33.1, high: 39.2, veryHigh: 43.9 },
    { minAge: 60, maxAge: 80, low: 32.9, high: 39.0, veryHigh: 43.7 },
  ],
};

/** % músculo esquelético según sexo y edad (Omron Healthcare). */
export function interpretSkeletalMuscle(
  percentage: number | undefined,
  age: number | undefined,
  gender: string | undefined
): MetricInterpretation | null {
  if (percentage === undefined || Number.isNaN(percentage) || !age || !isBiologicalSex(gender)) return null;

  const band = SKELETAL_MUSCLE_BANDS[gender].find(b => age >= b.minAge && age <= b.maxAge);
  if (!band) return null;

  if (percentage < band.low) {
    return { label: "Bajo", tone: "high", hint: "Músculo esquelético bajo para sexo y edad" };
  }
  if (percentage < band.high) {
    return { label: "Normal", tone: "normal", hint: "Músculo esquelético en rango normal" };
  }
  if (percentage < band.veryHigh) {
    return { label: "Elevado", tone: "good", hint: "Músculo esquelético elevado" };
  }
  return { label: "Muy elevado", tone: "good", hint: "Músculo esquelético muy elevado" };
}

/** Nivel de grasa visceral Omron: ≤9 normal, 10–14 alto, ≥15 muy alto. */
export function interpretVisceralFat(level: number | undefined): MetricInterpretation | null {
  if (level === undefined || Number.isNaN(level)) return null;

  if (level <= 9) {
    return { label: "Normal", tone: "normal", hint: "Nivel de grasa visceral normal (Omron)" };
  }
  if (level <= 14) {
    return { label: "Alto", tone: "high", hint: "Nivel de grasa visceral alto (Omron)" };
  }
  return { label: "Muy alto", tone: "veryHigh", hint: "Nivel de grasa visceral muy alto (Omron)" };
}

/** Compara edad metabólica con la cronológica: menor es más favorable. */
export function interpretMetabolicAge(
  metabolicAge: number | undefined,
  chronologicalAge: number | undefined
): MetricInterpretation | null {
  if (metabolicAge === undefined || Number.isNaN(metabolicAge) || !chronologicalAge) return null;

  const diff = Math.round(metabolicAge - chronologicalAge);
  if (diff <= -1) {
    const years = Math.abs(diff);
    return {
      label: `-${years} años`,
      tone: "good",
      hint: "Edad metabólica por debajo de tu edad",
    };
  }
  if (diff >= 1) {
    return {
      label: `+${diff} años`,
      tone: diff >= 5 ? "veryHigh" : "high",
      hint: "Edad metabólica por encima de tu edad",
    };
  }
  return { label: "Igual", tone: "normal", hint: "Edad metabólica alineada con tu edad" };
}
