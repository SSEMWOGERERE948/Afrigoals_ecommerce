import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price amount with currency symbol
 * @param amount - The price amount (can be null/undefined)
 * @param currency - Currency code/symbol-ish input (default: "UGX")
 * @returns Formatted price string (e.g., "UGX 95,000")
 */
export function formatPrice(
  amount: number | null | undefined,
  currency = "UGX",
): string {
  const value = Number.isFinite(amount as number) ? (amount as number) : 0;

  const currencyCode =
    (currency ?? "UGX")
      .toString()
      .toUpperCase()
      .match(/[A-Z]{3}/)?.[0] ?? "UGX";

  const fractionDigits = currencyCode === "UGX" ? 0 : 2;

  try {
    // Use locale that yields comma-grouped digits and "UGX" prefix for UGX.
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    const number = new Intl.NumberFormat("en-UG", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
    return `${currencyCode} ${number}`;
  }
}

type DateFormatOption = "short" | "long" | "datetime";

const DATE_FORMAT_OPTIONS: Record<
  DateFormatOption,
  Intl.DateTimeFormatOptions
> = {
  short: { day: "numeric", month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  datetime: {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

/**
 * Format a date string with locale-specific formatting
 * @param date - ISO date string (can be null/undefined)
 * @param format - Format option: "short" (5 Jan), "long" (5 January 2025), "datetime" (5 January 2025, 14:30)
 * @param fallback - Fallback text when date is null/undefined
 * @returns Formatted date string
 */
export function formatDate(
  date: string | null | undefined,
  format: DateFormatOption = "long",
  fallback = "Date unknown",
): string {
  if (!date) return fallback;
  return new Date(date).toLocaleDateString(
    "en-GB",
    DATE_FORMAT_OPTIONS[format],
  );
}

/**
 * Format an order number for display (shows only the last segment after the last hyphen)
 * @param orderNumber - Full order number (e.g., "ORD-2024-ABC123")
 * @returns Shortened order number (e.g., "ABC123") or "N/A" if null
 */
export function formatOrderNumber(
  orderNumber: string | null | undefined,
): string {
  if (!orderNumber) return "N/A";
  return orderNumber.split("-").pop() ?? orderNumber;
}
