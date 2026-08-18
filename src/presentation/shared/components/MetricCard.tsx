import type { Trend } from "@presentation/shared/utils/bioimpedanceTrend";

export interface MetricCardProps {
  label: string;
  value: number | undefined;
  previousValue: number | null | undefined;
  unit: string;
  trend: Trend | null;
}

/** Muestra una métrica de bioimpedancia con su tendencia respecto a la medición anterior. */
export function MetricCard({ label, value, previousValue, unit, trend }: MetricCardProps) {
  return (
    <div className=" border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-600 font-semibold">{label}</p>
      </div>
      <div className="flex flex-col items-start justify-between mb-1">
        <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {value ?? "—"} {value !== undefined ? unit : ""}{" "}
          {trend && (
            <span className={`text-md ${trend.color} font-bold`} title={trend.icon === "▲" ? "Aumentó" : "Disminuyó"}>
              {trend.icon}
            </span>
          )}
        </p>
        <p className="text-sm text-gray-400 font-semibold">{previousValue ? `${previousValue} ${unit}` : "N/A"}</p>
      </div>
    </div>
  );
}
