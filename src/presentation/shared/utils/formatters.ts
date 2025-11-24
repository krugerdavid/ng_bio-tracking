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
