/**
 * Formats a number or string with thousands separators using dots
 * @param value - The number or string to format
 * @returns The formatted string with dots as thousands separators
 * @example
 * formatWithThousandsSeparator("4413569") // "4.413.569"
 * formatWithThousandsSeparator(4413569) // "4.413.569"
 */
export function formatWithThousandsSeparator(value: string | number): string {
  const stringValue = String(value);
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formats a number as currency (CLP-style with $ and dots as thousands separator)
 */
export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-CL")}`;
}

/**
 * Formats a date for display (es-ES locale).
 * Used in lists and tables; optional second argument for Intl options.
 */
export function formatLocalDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  };
  return new Date(date).toLocaleDateString("es-ES", opts);
}

/**
 * Formats YYYY-MM as short month + 2-digit year (e.g. "nov 25").
 */
export function formatShortMonth(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  return date.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
}
