/**
 * Safe number formatting — prevents "Cannot read property 'toFixed' of undefined" crashes.
 * Use these instead of raw .toFixed() throughout the app.
 */

export function fixed(value: number | null | undefined, decimals: number = 0): string {
  if (value == null || isNaN(value)) return "0";
  return Number(value).toFixed(decimals);
}

export function dollars(value: number | null | undefined, decimals: number = 2): string {
  if (value == null || isNaN(value)) return "$0.00";
  return `$${Number(value).toFixed(decimals)}`;
}
