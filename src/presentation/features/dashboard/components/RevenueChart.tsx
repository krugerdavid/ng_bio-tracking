import { useState } from "react";
import { formatCurrency, formatShortMonth } from "@presentation/shared/utils/formatters";

const BAR_COLOR = "#f97316"; // orange-500, misma identidad que el resto de la app
const CHART_HEIGHT = 160;
const BAR_RADIUS = 4;

interface RevenueChartProps {
  data: { month: string; total: number }[];
}

/**
 * Barras de ingresos por mes (serie única, sin necesidad de leyenda categórica).
 * Tooltip por tap/hover en cada barra — pensado mobile-first, no depende de :hover.
 */
export function RevenueChart({ data }: RevenueChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">Todavía no hay pagos registrados.</p>;
  }

  const max = Math.max(...data.map(d => d.total), 1);
  const barWidth = 100 / data.length;
  const active = activeIndex !== null ? data[activeIndex] : null;
  // Mostrar como máximo ~6 etiquetas de mes para que no se superpongan con muchas barras.
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div>
      <div className="h-6 mb-1 text-center">
        {active && (
          <span className="text-sm font-semibold text-gray-900">
            {formatShortMonth(active.month)} · {formatCurrency(active.total)}
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: CHART_HEIGHT }}
        role="img"
        aria-label="Ingresos por mes"
      >
        {data.map((d, i) => {
          const barHeight = Math.max((d.total / max) * (CHART_HEIGHT - 20), d.total > 0 ? 3 : 0);
          const x = i * barWidth;
          const y = CHART_HEIGHT - 20 - barHeight;
          const isActive = activeIndex === i;
          return (
            <g
              key={d.month}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setActiveIndex(isActive ? null : i)}
              className="cursor-pointer"
            >
              {/* Hit target más ancho que la barra visible, mejor para tocar en celular */}
              <rect x={x} y={0} width={barWidth} height={CHART_HEIGHT - 20} fill="transparent" />
              <rect
                x={x + barWidth * 0.2}
                y={y}
                width={barWidth * 0.6}
                height={barHeight}
                rx={BAR_RADIUS}
                fill={BAR_COLOR}
                opacity={isActive ? 1 : 0.85}
              />
              {(i % labelEvery === 0 || i === data.length - 1) && (
                <text
                  x={i === 0 ? x : i === data.length - 1 ? x + barWidth : x + barWidth / 2}
                  y={CHART_HEIGHT - 6}
                  textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                  fontSize="6"
                  fill="#6b7280"
                >
                  {formatShortMonth(d.month)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
