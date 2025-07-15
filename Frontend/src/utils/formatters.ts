/**
 * Formats a number with commas as thousand separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (value == null || isNaN(value)) return '0';
  return value.toLocaleString('en-US');
}

/**
 * Formats a number as currency with commas as thousand separators
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  if (value == null || isNaN(value)) return '$0';
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
