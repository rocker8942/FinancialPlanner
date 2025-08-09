import { generateSecureShareableUrl } from './encryption';

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

/**
 * Parses a formatted number string back into a number
 * @param value - The formatted string to parse
 * @returns Parsed number value
 */
export function parseFormattedNumber(value: string): number {
  // Remove currency symbol, commas and other non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  const parsedValue = parseFloat(cleanValue);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Formats a decimal value as a percentage string, eliminating floating point precision issues
 * @param value - The decimal value to format (e.g., 0.03 for 3%)
 * @returns Formatted percentage string without trailing zeros
 */
export function formatPercentage(value: number): string {
  if (value == null || isNaN(value)) return '0';
  
  // Convert to percentage and round to 2 decimal places to eliminate precision errors
  const percentage = Math.round((value * 100) * 100) / 100;
  
  // Format with up to 2 decimal places, removing trailing zeros
  return percentage.toString();
}

/**
 * Generates a secure shareable URL with encrypted financial profile data
 * Falls back to legacy URL parameters if encryption fails or for backward compatibility
 * @param profile - The financial profile to encode in the URL
 * @param useEncryption - Whether to use encrypted URLs (default: true)
 * @returns Complete shareable URL string with encrypted fragment or legacy parameters
 */
export function generateShareableUrl(profile: any, useEncryption: boolean = true): string {
  const baseUrl = `${window.location.origin}/retirementplanner`;
  
  if (useEncryption) {
    try {
      // Use the new secure URL generation from encryption utils
      const secureUrl = generateSecureShareableUrl(profile, baseUrl);
      
      // If secure URL generation succeeded and is different from base URL, use it
      if (secureUrl !== baseUrl) {
        return secureUrl;
      }
    } catch (error) {
      console.warn('Encrypted URL generation failed, falling back to legacy format:', error);
    }
  }
  
  // Legacy URL generation for backward compatibility or fallback
  const params = new URLSearchParams();
  
  // Add non-zero values to keep URL clean
  if (profile.currentAge && profile.currentAge !== 30) {
    params.append('currentAge', profile.currentAge.toString());
  }
  
  if (profile.retireAge && profile.retireAge !== 65) {
    params.append('retireAge', profile.retireAge.toString());
  }
  
  if (profile.superannuationBalance && profile.superannuationBalance > 0) {
    params.append('super', profile.superannuationBalance.toString());
  }
  
  if (profile.salary && profile.salary > 0) {
    params.append('income', profile.salary.toString());
  }
  
  if (profile.expenses && profile.expenses > 0) {
    params.append('expense', profile.expenses.toString());
  }
  
  if (profile.propertyAssets && profile.propertyAssets > 0) {
    params.append('investmentProperty', profile.propertyAssets.toString());
  }
  
  if (profile.savings && profile.savings > 0) {
    params.append('savings', profile.savings.toString());
  }
  
  if (profile.mortgageBalance && profile.mortgageBalance > 0) {
    params.append('mortgage', profile.mortgageBalance.toString());
  }
  
  // Partner information
  if (profile.relationshipStatus === 'couple') {
    if (profile.partnerAge && profile.partnerAge !== 30) {
      params.append('partnerAge', profile.partnerAge.toString());
    }
    
    if (profile.partnerRetireAge && profile.partnerRetireAge !== 65) {
      params.append('partnerRetireAge', profile.partnerRetireAge.toString());
    }
    
    if (profile.partnerSalary && profile.partnerSalary > 0) {
      params.append('partnerSalary', profile.partnerSalary.toString());
    }
  }
  
  // Advanced options (only if different from defaults)
  if (profile.deathAge && profile.deathAge !== 90) {
    params.append('deathAge', profile.deathAge.toString());
  }
  
  if (profile.propertyGrowthRate && profile.propertyGrowthRate !== 0.03) {
    params.append('propertyGrowthRate', (profile.propertyGrowthRate * 100).toString());
  }
  
  if (profile.savingsGrowthRate && profile.savingsGrowthRate !== 0.025) {
    params.append('savingsGrowthRate', (profile.savingsGrowthRate * 100).toString());
  }
  
  if (profile.mortgageRate && profile.mortgageRate !== 0.06) {
    params.append('mortgageRate', (profile.mortgageRate * 100).toString());
  }
  
  if (profile.superannuationRate && profile.superannuationRate !== 0.07) {
    params.append('superannuationRate', (profile.superannuationRate * 100).toString());
  }
  
  if (profile.cpiGrowthRate && profile.cpiGrowthRate !== 0.03) {
    params.append('cpiGrowthRate', (profile.cpiGrowthRate * 100).toString());
  }
  
  if (profile.propertyRentalYield && profile.propertyRentalYield !== 0.033) {
    params.append('propertyRentalYield', (profile.propertyRentalYield * 100).toString());
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
