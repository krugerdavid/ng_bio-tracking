import { describe, expect, it } from "vitest";
import {
  interpretBodyFat,
  interpretIMC,
  interpretMetabolicAge,
  interpretSkeletalMuscle,
  interpretVisceralFat,
} from "../bodyCompositionInterpretation";

describe("interpretIMC", () => {
  it("classifies WHO categories at boundaries", () => {
    expect(interpretIMC(18.4)?.label).toBe("Inferior");
    expect(interpretIMC(18.5)?.label).toBe("Normal");
    expect(interpretIMC(24.9)?.label).toBe("Normal");
    expect(interpretIMC(25)?.label).toBe("Sobrepeso");
    expect(interpretIMC(29.9)?.label).toBe("Sobrepeso");
    expect(interpretIMC(30)?.label).toBe("Obesidad");
  });

  it("returns null when value is missing", () => {
    expect(interpretIMC(undefined)).toBeNull();
  });
});

describe("interpretBodyFat", () => {
  it("classifies male 20-39 Gallagher ranges", () => {
    expect(interpretBodyFat(7.9, 35, "male")?.label).toBe("Bajo");
    expect(interpretBodyFat(8.0, 35, "male")?.label).toBe("Normal");
    expect(interpretBodyFat(19.9, 35, "male")?.label).toBe("Normal");
    expect(interpretBodyFat(20.0, 35, "male")?.label).toBe("Alto");
    expect(interpretBodyFat(24.9, 35, "male")?.label).toBe("Alto");
    expect(interpretBodyFat(25.0, 35, "male")?.label).toBe("Muy alto");
  });

  it("classifies female 40-59 Gallagher ranges", () => {
    expect(interpretBodyFat(22.9, 45, "female")?.label).toBe("Bajo");
    expect(interpretBodyFat(23.0, 45, "female")?.label).toBe("Normal");
    expect(interpretBodyFat(33.9, 45, "female")?.label).toBe("Normal");
    expect(interpretBodyFat(34.0, 45, "female")?.label).toBe("Alto");
    expect(interpretBodyFat(39.9, 45, "female")?.label).toBe("Alto");
    expect(interpretBodyFat(40.0, 45, "female")?.label).toBe("Muy alto");
  });

  it("returns null without sex or supported age", () => {
    expect(interpretBodyFat(21, 35, "other")).toBeNull();
    expect(interpretBodyFat(21, 19, "female")).toBeNull();
    expect(interpretBodyFat(21, 80, "male")).toBeNull();
  });
});

describe("interpretSkeletalMuscle", () => {
  it("classifies male 18-39 Omron ranges", () => {
    expect(interpretSkeletalMuscle(33.2, 30, "male")?.label).toBe("Bajo");
    expect(interpretSkeletalMuscle(33.3, 30, "male")?.label).toBe("Normal");
    expect(interpretSkeletalMuscle(39.3, 30, "male")?.label).toBe("Normal");
    expect(interpretSkeletalMuscle(39.4, 30, "male")?.label).toBe("Elevado");
    expect(interpretSkeletalMuscle(44.0, 30, "male")?.label).toBe("Elevado");
    expect(interpretSkeletalMuscle(44.1, 30, "male")?.label).toBe("Muy elevado");
  });

  it("classifies female 60-80 Omron ranges", () => {
    expect(interpretSkeletalMuscle(23.8, 70, "female")?.label).toBe("Bajo");
    expect(interpretSkeletalMuscle(23.9, 70, "female")?.label).toBe("Normal");
    expect(interpretSkeletalMuscle(29.9, 70, "female")?.label).toBe("Normal");
    expect(interpretSkeletalMuscle(30.0, 70, "female")?.label).toBe("Elevado");
    expect(interpretSkeletalMuscle(34.9, 70, "female")?.label).toBe("Elevado");
    expect(interpretSkeletalMuscle(35.0, 70, "female")?.label).toBe("Muy elevado");
  });

  it("treats low muscle as a warning tone", () => {
    expect(interpretSkeletalMuscle(20, 25, "female")?.tone).toBe("high");
    expect(interpretSkeletalMuscle(36, 25, "female")?.tone).toBe("good");
  });
});

describe("interpretVisceralFat", () => {
  it("classifies Omron visceral fat levels", () => {
    expect(interpretVisceralFat(9)?.label).toBe("Normal");
    expect(interpretVisceralFat(10)?.label).toBe("Alto");
    expect(interpretVisceralFat(14)?.label).toBe("Alto");
    expect(interpretVisceralFat(15)?.label).toBe("Muy alto");
  });
});

describe("interpretMetabolicAge", () => {
  it("compares against chronological age", () => {
    expect(interpretMetabolicAge(30, 35)?.label).toBe("-5 años");
    expect(interpretMetabolicAge(36, 35)?.label).toBe("+1 años");
    expect(interpretMetabolicAge(35, 35)?.label).toBe("Igual");
    expect(interpretMetabolicAge(41, 35)?.tone).toBe("veryHigh");
  });
});
