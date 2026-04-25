import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format date consistently for server and client rendering
 * Uses UTC to avoid hydration mismatches due to timezone differences
 */
export function formatDate(date: Date | string | null | undefined, formatStr: string = "dd MMM yyyy"): string {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "-";

  return format(dateObj, formatStr, { locale: id });
}

/**
 * Format date with time consistently
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

/**
 * Format date with day name consistently
 */
export function formatDateWithDay(date: Date | string | null | undefined): string {
  return formatDate(date, "EEEE, dd MMM yyyy");
}
