export type TrendDirection = "up" | "down";

export interface Trend {
  direction: TrendDirection;
}

/** Compara un valor actual contra el anterior y devuelve la dirección de tendencia, o null si no aplica. */
export function getTrendIndicator(current: number | undefined, previous: number | null | undefined): Trend | null {
  if (current === undefined || previous === null || previous === undefined) return null;

  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return null;

  return { direction: diff > 0 ? "up" : "down" };
}
