import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import {
  interpretBodyFat,
  interpretIMC,
  interpretMetabolicAge,
  interpretSkeletalMuscle,
  interpretVisceralFat,
} from "@domain/bioimpedance/bodyCompositionInterpretation";
import { MetricCard } from "@presentation/shared/components/MetricCard";
import { getTrendIndicator } from "@presentation/shared/utils/bioimpedanceTrend";

interface BioimpedanceMetricsGridProps {
  latest: Bioimpedance;
  previous?: Bioimpedance | null;
  age?: number;
  gender?: string;
}

/** Grilla de KPIs de bioimpedancia con tendencia e interpretación clínica. */
export function BioimpedanceMetricsGrid({ latest, previous, age, gender }: BioimpedanceMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        label="Estatura"
        value={latest.height}
        previousValue={previous?.height ?? null}
        unit="cm"
        trend={getTrendIndicator(latest.height, previous?.height ?? null)}
        darkBorder
      />
      <MetricCard
        label="Peso"
        value={latest.weight}
        previousValue={previous?.weight ?? null}
        unit="kg"
        trend={getTrendIndicator(latest.weight, previous?.weight ?? null)}
        darkBorder
      />
      <MetricCard
        label="IMC"
        value={latest.imc}
        previousValue={previous?.imc ?? null}
        unit=""
        trend={getTrendIndicator(latest.imc, previous?.imc ?? null)}
        interpretation={interpretIMC(latest.imc)}
      />
      <MetricCard
        label="% Grasa"
        value={latest.bodyFatPercentage}
        previousValue={previous?.bodyFatPercentage ?? null}
        unit="%"
        trend={getTrendIndicator(latest.bodyFatPercentage, previous?.bodyFatPercentage ?? null)}
        interpretation={interpretBodyFat(latest.bodyFatPercentage, age, gender)}
      />
      <MetricCard
        label="% Músculo"
        value={latest.muscleMassPercentage}
        previousValue={previous?.muscleMassPercentage ?? null}
        unit="%"
        trend={getTrendIndicator(latest.muscleMassPercentage, previous?.muscleMassPercentage ?? null)}
        interpretation={interpretSkeletalMuscle(latest.muscleMassPercentage, age, gender)}
      />
      <MetricCard
        label="Metabolismo basal"
        value={latest.kcal}
        previousValue={previous?.kcal ?? null}
        unit="kcal"
        trend={getTrendIndicator(latest.kcal, previous?.kcal ?? null)}
        darkBorder
      />
      <MetricCard
        label="Edad Metabólica"
        value={latest.metabolicAge}
        previousValue={previous?.metabolicAge ?? null}
        unit="años"
        trend={getTrendIndicator(latest.metabolicAge, previous?.metabolicAge ?? null)}
        interpretation={interpretMetabolicAge(latest.metabolicAge, age)}
      />
      <MetricCard
        label="% Grasa Visceral"
        value={latest.visceralFatPercentage}
        previousValue={previous?.visceralFatPercentage ?? null}
        unit="%"
        trend={getTrendIndicator(latest.visceralFatPercentage, previous?.visceralFatPercentage ?? null)}
        interpretation={interpretVisceralFat(latest.visceralFatPercentage)}
      />
    </div>
  );
}
