import type { Trend } from "@presentation/shared/utils/bioimpedanceTrend";
import type { InterpretationTone, MetricInterpretation } from "@domain/bioimpedance/bodyCompositionInterpretation";

export interface MetricCardProps {
  label: string;
  value: number | undefined;
  previousValue: number | null | undefined;
  unit: string;
  trend: Trend | null;
  interpretation?: MetricInterpretation | null;
  /** Borde oscuro para métricas sin interpretación (estatura, peso, kcal). */
  darkBorder?: boolean;
}

const TONE_CLASSES: Record<InterpretationTone, string> = {
  low: "bg-sky-800 text-white",
  normal: "bg-green-800 text-white",
  high: "bg-amber-800 text-white",
  veryHigh: "bg-red-800 text-white",
  good: "bg-emerald-800 text-white",
};

const TONE_CARD_CLASSES: Record<InterpretationTone, string> = {
  low: "border-sky-800 bg-sky-50",
  normal: "border-green-800 bg-green-50",
  high: "border-amber-800 bg-amber-50",
  veryHigh: "border-red-800 bg-red-50",
  good: "border-emerald-800 bg-emerald-50",
};

function formatMetricDelta(current: number | undefined, previous: number | null | undefined, unit: string): string {
  if (current === undefined || previous === null || previous === undefined) {
    return "Sin anterior";
  }

  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return "Sin cambios";

  const abs = Math.abs(Math.round(diff * 10) / 10);
  const amount = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  const sign = diff > 0 ? "+" : "−";
  const unitLabel = unit === "años" && abs === 1 ? "año" : unit;
  return `${sign}${amount}${unitLabel ? ` ${unitLabel}` : ""}`;
}

/** Muestra una métrica de bioimpedancia con su tendencia respecto a la medición anterior. */
export function MetricCard({
  label,
  value,
  previousValue,
  unit,
  trend,
  interpretation,
  darkBorder = false,
}: MetricCardProps) {
  const cardClass = interpretation
    ? TONE_CARD_CLASSES[interpretation.tone]
    : darkBorder
      ? "border-gray-700 bg-gray-50"
      : "border-gray-200 bg-white";

  const delta = formatMetricDelta(value, previousValue, unit);
  const previousLabel =
    previousValue !== null && previousValue !== undefined
      ? `Anterior: ${previousValue}${unit ? ` ${unit}` : ""}`
      : undefined;

  return (
    <div className={`border ${cardClass} p-5 sm:p-6 rounded-lg shadow-sm flex flex-col h-full`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-900 font-bold truncate">{label}</p>
        {interpretation && (
          <span
            className={`shrink-0 max-w-[60%] text-center text-[10px] sm:text-xs leading-tight font-extrabold uppercase rounded-full px-2.5 py-1 ${TONE_CLASSES[interpretation.tone]}`}
            title={interpretation.hint}
          >
            {interpretation.label}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 text-gray-900">
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {value ?? "—"}
          {value !== undefined && unit ? <span className="ml-1 text-xs font-bold text-gray-900">{unit}</span> : null}
        </p>
        <span
          className="text-base font-bold leading-none shrink-0 text-orange-700"
          title={previousLabel ?? (trend ? (trend.direction === "up" ? "Aumentó" : "Disminuyó") : undefined)}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}
