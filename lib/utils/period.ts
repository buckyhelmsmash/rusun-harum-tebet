import { format, subMonths } from "date-fns";

/**
 * Converts a `yyyy-MM` period string into a human-readable billing date range.
 * Billing cycle runs from the 25th of the previous month to the 25th of the period month.
 *
 * @example formatPeriodRange("2026-03") → "25 Feb – 25 Mar 2026"
 */
export function formatPeriodRange(period: string): string {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;

  const endDate = new Date(year, month - 1, 25);
  const startDate = subMonths(endDate, 1);

  const startStr = format(startDate, "d MMM");
  const endStr = format(endDate, "d MMM yyyy");

  return `${startStr} – ${endStr}`;
}

/**
 * Formats a `yyyy-MM` period as a short month label.
 *
 * @example formatPeriodLabel("2026-03") → "Mar 2026"
 */
export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;

  return format(new Date(year, month - 1, 1), "MMM yyyy");
}

/**
 * Returns the target billing period for invoice generation based on the current date.
 *
 * - If today is on/after the 25th → current month's billing cycle just completed → return current month
 * - If today is before the 25th → previous month's billing cycle was last completed → return previous month
 *
 * @example
 *   getTargetBillingPeriod(new Date("2026-03-05")) → "2026-02"
 *   getTargetBillingPeriod(new Date("2026-03-26")) → "2026-03"
 */
export function getTargetBillingPeriod(now: Date = new Date()): string {
  const day = now.getDate();

  if (day >= 25) {
    return format(now, "yyyy-MM");
  }
  return format(subMonths(now, 1), "yyyy-MM");
}
