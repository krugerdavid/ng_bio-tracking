import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatCurrency, formatShortMonth } from "@presentation/shared/utils/formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BAR_COLOR = "#f97316"; // orange-500, misma identidad que el resto de la app
const BAR_COLOR_HOVER = "#ea580c"; // orange-600

interface RevenueChartProps {
  data: { month: string; total: number }[];
}

/** Ingresos por mes (serie única) — barras, sin necesidad de leyenda categórica. */
export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">Todavía no hay pagos registrados.</p>;
  }

  const chartData = {
    labels: data.map(d => formatShortMonth(d.month)),
    datasets: [
      {
        data: data.map(d => d.total),
        backgroundColor: BAR_COLOR,
        hoverBackgroundColor: BAR_COLOR_HOVER,
        borderRadius: 4,
        borderSkipped: false as const,
        maxBarThickness: 40,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => formatCurrency(context.parsed.y ?? 0),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          callback: value => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
