export interface Trend {
  icon: string;
  color: string;
}

/** Compara un valor actual contra el anterior y devuelve un indicador de tendencia (▲/▼) o null si no aplica. */
export function getTrendIndicator(current: number | undefined, previous: number | null | undefined): Trend | null {
  if (current === undefined || previous === null || previous === undefined) return null;

  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return null; // Ignore very small differences

  if (diff > 0) {
    return { icon: "▲", color: "text-red-500" };
  } else {
    return { icon: "▼", color: "text-green-500" };
  }
}
