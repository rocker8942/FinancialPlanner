import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { formatCurrency, formatNumber, parseFormattedNumber, formatPercentage, generateShareableUrl } from '../formatters'

// Mock window.location for URL generation tests
const mockLocation = {
  origin: 'http://localhost:5173'
}

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
  })
})

describe('formatCurrency', () => {
  it('should format positive numbers as currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
    expect(formatCurrency(1000000)).toBe('$1,000,000')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('should handle null and undefined', () => {
    expect(formatCurrency(null as any)).toBe('$0')
    expect(formatCurrency(undefined as any)).toBe('$0')
  })
})

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('parseFormattedNumber', () => {
  it('should parse currency strings', () => {
    expect(parseFormattedNumber('$1,000')).toBe(1000)
    expect(parseFormattedNumber('$1,000,000')).toBe(1000000)
  })

  it('should parse plain number strings', () => {
    expect(parseFormattedNumber('1000')).toBe(1000)
    expect(parseFormattedNumber('1,000')).toBe(1000)
  })

  it('should handle invalid strings', () => {
    expect(parseFormattedNumber('invalid')).toBe(0)
    expect(parseFormattedNumber('')).toBe(0)
  })
})

describe('formatPercentage', () => {
  it('should format decimal values as percentages', () => {
    expect(formatPercentage(0.03)).toBe('3')
    expect(formatPercentage(0.025)).toBe('2.5')
  })

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0')
  })

  it('should handle null and undefined', () => {
    expect(formatPercentage(null as any)).toBe('0')
    expect(formatPercentage(undefined as any)).toBe('0')
  })
})

describe('generateShareableUrl', () => {
  it('should generate URL with basic profile data', () => {
    const profile = {
      currentAge: 35,
      retireAge: 60,
      salary: 100000,
      expenses: 50000,
      savings: 25000,
      relationshipStatus: 'single'
    }

    const url = generateShareableUrl(profile)
    expect(url).toContain('http://localhost:5173/retirementplanner')
    expect(url).toContain('currentAge=35')
    expect(url).toContain('retireAge=60')
    expect(url).toContain('income=100000')
    expect(url).toContain('expense=50000')
    expect(url).toContain('savings=25000')
  })

  it('should exclude default values', () => {
    const profile = {
      currentAge: 30, // default value
      retireAge: 65, // default value
      salary: 50000,
      relationshipStatus: 'single'
    }

    const url = generateShareableUrl(profile)
    expect(url).not.toContain('currentAge=30')
    expect(url).not.toContain('retireAge=65')
    expect(url).toContain('income=50000')
  })

  it('should include partner information for couples', () => {
    const profile = {
      relationshipStatus: 'couple',
      partnerAge: 32,
      partnerRetireAge: 62,
      partnerSalary: 60000,
      salary: 50000
    }

    const url = generateShareableUrl(profile)
    expect(url).toContain('partnerAge=32')
    expect(url).toContain('partnerRetireAge=62')
    expect(url).toContain('partnerSalary=60000')
  })

  it('should exclude partner information for singles', () => {
    const profile = {
      relationshipStatus: 'single',
      partnerAge: 32,
      partnerRetireAge: 62,
      partnerSalary: 60000,
      salary: 50000
    }

    const url = generateShareableUrl(profile)
    expect(url).not.toContain('partnerAge')
    expect(url).not.toContain('partnerRetireAge')
    expect(url).not.toContain('partnerSalary')
  })

  it('should include advanced options when different from defaults', () => {
    const profile = {
      salary: 50000,
      deathAge: 85, // different from default 90
      propertyGrowthRate: 0.04, // different from default 0.03
      savingsGrowthRate: 0.05, // different from default 0.025
      relationshipStatus: 'single'
    }

    const url = generateShareableUrl(profile)
    expect(url).toContain('deathAge=85')
    expect(url).toContain('propertyGrowthRate=4')
    expect(url).toContain('savingsGrowthRate=5')
  })

  it('should return base URL when no meaningful data provided', () => {
    const profile = {
      relationshipStatus: 'single'
    }

    const url = generateShareableUrl(profile)
    expect(url).toBe('http://localhost:5173/retirementplanner')
  })
})