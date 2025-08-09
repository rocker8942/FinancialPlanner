import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  encryptSensitiveData, 
  decryptSensitiveData, 
  setSecureItem, 
  getSecureItem,
  removeSecureItem,
  clearAllSecureData,
  compressAndEncryptForUrl,
  decryptAndDecompressFromUrl,
  generateSecureShareableUrl,
  parseSecureUrlFragment
} from '../encryption';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  configurable: true
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

describe('Encryption Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock consistent session ID for testing
    sessionStorageMock.getItem.mockReturnValue('test-session-id');
  });

  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt simple data', () => {
      const testData = { salary: 100000, savings: 50000 };
      
      const encrypted = encryptSensitiveData(testData);
      expect(encrypted).toContain('encrypted:');
      expect(encrypted).not.toContain('100000'); // Should not contain plaintext data
      
      const decrypted = decryptSensitiveData(encrypted);
      expect(decrypted).toEqual(testData);
    });

    it('should handle complex financial data', () => {
      const complexData = {
        propertyAssets: 800000,
        savings: 200000,
        mortgageBalance: 400000,
        mortgageRate: 0.055,
        salary: 120000,
        partnerSalary: 90000,
        expenses: 80000,
        currentAge: 35,
        relationshipStatus: 'couple' as const,
        isHomeowner: true
      };

      const encrypted = encryptSensitiveData(complexData);
      const decrypted = decryptSensitiveData(encrypted);
      
      expect(decrypted).toEqual(complexData);
    });

    it('should return null for corrupted encrypted data', () => {
      const corrupted = 'encrypted:invalid_base64_data';
      const result = decryptSensitiveData(corrupted);
      expect(result).toBeNull();
    });

    it('should handle legacy unencrypted data', () => {
      const legacyData = { salary: 50000 };
      const jsonString = JSON.stringify(legacyData);
      
      const result = decryptSensitiveData(jsonString);
      expect(result).toEqual(legacyData);
    });
  });

  describe('Secure Storage Functions', () => {
    it('should store and retrieve encrypted data', () => {
      const testData = { salary: 75000, expenses: 45000 };
      const key = 'test-key';

      setSecureItem(key, testData);
      
      // Verify localStorage.setItem was called with encrypted data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        key, 
        expect.stringContaining('encrypted:')
      );

      // Mock the localStorage.getItem return value
      const encryptedValue = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(encryptedValue);

      const retrieved = getSecureItem(key);
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getSecureItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('should remove secure items', () => {
      removeSecureItem('test-key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should clear all secure data', () => {
      clearAllSecureData();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('financial-input');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('sessionId');
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption failures gracefully', () => {
      // Mock CryptoJS to fail
      const circularObj: any = {};
      circularObj.self = circularObj; // Create circular reference
      
      const result = encryptSensitiveData(circularObj);
      // Should fall back to JSON.stringify which will also fail, but handled gracefully
      expect(typeof result).toBe('string');
    });

    it('should handle decryption failures gracefully', () => {
      const invalidData = 'encrypted:clearly_not_valid_encryption';
      const result = decryptSensitiveData(invalidData);
      expect(result).toBeNull();
    });
  });

  describe('Session Key Generation', () => {
    it('should generate consistent keys within the same session', () => {
      const testData1 = { test: 'data1' };
      const testData2 = { test: 'data2' };
      
      // Mock consistent session ID
      sessionStorageMock.getItem.mockReturnValue('consistent-session-id');
      
      const encrypted1 = encryptSensitiveData(testData1);
      const encrypted2 = encryptSensitiveData(testData2);
      
      // Both should decrypt successfully with the same key
      const decrypted1 = decryptSensitiveData(encrypted1);
      const decrypted2 = decryptSensitiveData(encrypted2);
      
      expect(decrypted1).toEqual(testData1);
      expect(decrypted2).toEqual(testData2);
    });
  });

  describe('URL Encryption Functions', () => {
    it('should compress and encrypt data for URLs', () => {
      const testData = { 
        salary: 100000, 
        savings: 50000, 
        propertyAssets: 800000,
        expenses: 60000
      };
      
      const encryptedUrl = compressAndEncryptForUrl(testData);
      expect(encryptedUrl).not.toBeNull();
      expect(typeof encryptedUrl).toBe('string');
      expect(encryptedUrl!.length).toBeGreaterThan(0);
      
      // Should not contain plaintext data
      expect(encryptedUrl).not.toContain('100000');
      expect(encryptedUrl).not.toContain('salary');
    });

    it('should decrypt and decompress URL data', () => {
      const testData = { 
        salary: 75000, 
        expenses: 45000,
        currentAge: 35,
        retireAge: 67
      };
      
      const encrypted = compressAndEncryptForUrl(testData);
      expect(encrypted).not.toBeNull();
      
      const decrypted = decryptAndDecompressFromUrl(encrypted!);
      
      // After data minimization and restoration, should have all default values filled in
      expect(decrypted).toEqual({
        ...testData,
        // Default values that get restored
        deathAge: 90,
        savingsGrowthRate: 0.025,
        propertyGrowthRate: 0.03,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65,
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        mortgageBalance: 0,
        superannuationBalance: 0,
        partnerSalary: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0
      });
    });

    it('should generate secure shareable URLs', () => {
      const testProfile = {
        salary: 120000,
        expenses: 80000,
        propertyAssets: 900000,
        savings: 150000,
        currentAge: 32,
        relationshipStatus: 'couple'
      };
      
      const baseUrl = 'https://example.com/retirementplanner';
      const secureUrl = generateSecureShareableUrl(testProfile, baseUrl);
      
      expect(secureUrl).toContain(baseUrl);
      expect(secureUrl).toContain('#enc:');
      expect(secureUrl).not.toContain('120000'); // No plaintext data
      expect(secureUrl).not.toContain('salary');
    });

    it('should parse secure URL fragments', () => {
      const testProfile = {
        salary: 95000,
        expenses: 65000,
        currentAge: 29,
        retireAge: 65,
        relationshipStatus: 'single' as const
      };
      
      const encrypted = compressAndEncryptForUrl(testProfile);
      expect(encrypted).not.toBeNull();
      
      const fragment = `enc:${encrypted}`;
      const parsed = parseSecureUrlFragment<typeof testProfile>(fragment);
      
      // After data minimization and restoration, should have all values including defaults
      expect(parsed).toEqual({
        ...testProfile,
        // Default values that get restored
        deathAge: 90,
        savingsGrowthRate: 0.025,
        propertyGrowthRate: 0.03,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65,
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        mortgageBalance: 0,
        superannuationBalance: 0,
        partnerSalary: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0
      });
    });

    it('should handle complex financial profiles', () => {
      const complexProfile = {
        propertyAssets: 1200000,
        savings: 300000,
        mortgageBalance: 600000,
        mortgageRate: 0.055,
        superannuationBalance: 180000,
        superannuationRate: 0.075,
        salary: 140000,
        partnerSalary: 110000,
        expenses: 95000,
        currentAge: 38,
        retireAge: 67,
        deathAge: 92,
        partnerAge: 36,
        partnerRetireAge: 65,
        savingsGrowthRate: 0.028,
        propertyGrowthRate: 0.032,
        cpiGrowthRate: 0.025,
        relationshipStatus: 'couple' as const,
        isHomeowner: true
      };

      // Test full round trip
      const encrypted = compressAndEncryptForUrl(complexProfile);
      expect(encrypted).not.toBeNull();
      
      const decrypted = decryptAndDecompressFromUrl<typeof complexProfile>(encrypted!);
      // Since this profile has many non-default values, it should restore exactly as expected
      // We need to add the default values that weren't specified
      const expectedProfile = {
        ...complexProfile,
        // Fill in any defaults that weren't in the original profile
        propertyRentalYield: 0.033, // Default value not in original
        pensionStartAge: 67, // Default value not in original
        pensionAmount: 0, // Default value not in original
        partnerPensionAmount: 0 // Default value not in original
      };
      expect(decrypted).toEqual(expectedProfile);
      
      // Test URL generation and parsing
      const baseUrl = 'https://app.example.com/retirementplanner';
      const secureUrl = generateSecureShareableUrl(complexProfile, baseUrl);
      expect(secureUrl).toContain('#enc:');
      
      const urlFragment = secureUrl.split('#')[1];
      const parsedFromUrl = parseSecureUrlFragment<typeof complexProfile>(urlFragment);
      expect(parsedFromUrl).toEqual(expectedProfile);
    });

    it('should handle Base64URL encoding correctly', () => {
      const testData = { test: 'data with special chars +/=' };
      
      const encrypted = compressAndEncryptForUrl(testData);
      expect(encrypted).not.toBeNull();
      
      // Should not contain standard Base64 characters that are problematic in URLs
      expect(encrypted).not.toContain('+');
      expect(encrypted).not.toContain('/');
      expect(encrypted).not.toContain('=');
      
      // Should be URL-safe
      expect(encrypted).toMatch(/^[A-Za-z0-9_-]*$/);
      
      const decrypted = decryptAndDecompressFromUrl<typeof testData>(encrypted!);
      // The restore function adds default financial profile values to any object
      expect(decrypted).toEqual({
        ...testData,
        // Default financial profile values get added
        currentAge: 30,
        retireAge: 65,
        deathAge: 90,
        savingsGrowthRate: 0.025,
        propertyGrowthRate: 0.03,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65,
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        mortgageBalance: 0,
        superannuationBalance: 0,
        salary: 0,
        partnerSalary: 0,
        expenses: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0
      });
    });

    it('should return null for invalid encrypted URLs', () => {
      const invalidData = 'not_valid_encrypted_data';
      const result = decryptAndDecompressFromUrl(invalidData);
      expect(result).toBeNull();
    });

    it('should return null for non-encrypted fragments', () => {
      const regularFragment = 'some-regular-fragment';
      const result = parseSecureUrlFragment(regularFragment);
      expect(result).toBeNull();
    });

    it('should fallback gracefully when encryption fails', () => {
      // Test with circular reference that would break JSON.stringify
      const circularData: any = { name: 'test' };
      circularData.self = circularData;
      
      const result = compressAndEncryptForUrl(circularData);
      expect(result).toBeNull(); // Should return null for unparseable data
    });

    it('should generate different encrypted values for same data (due to AES randomness)', () => {
      const testData = { salary: 100000 };
      
      const encrypted1 = compressAndEncryptForUrl(testData);
      const encrypted2 = compressAndEncryptForUrl(testData);
      
      expect(encrypted1).not.toBeNull();
      expect(encrypted2).not.toBeNull();
      // Should be different due to AES encryption randomness
      expect(encrypted1).not.toEqual(encrypted2);
      
      // But both should decrypt to the same expanded data with defaults
      const decrypted1 = decryptAndDecompressFromUrl(encrypted1!);
      const decrypted2 = decryptAndDecompressFromUrl(encrypted2!);
      
      const expectedData = {
        ...testData,
        // Default values that get restored
        currentAge: 30,
        retireAge: 65,
        deathAge: 90,
        savingsGrowthRate: 0.025,
        propertyGrowthRate: 0.03,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65,
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        mortgageBalance: 0,
        superannuationBalance: 0,
        partnerSalary: 0,
        expenses: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0
      };
      
      expect(decrypted1).toEqual(expectedData);
      expect(decrypted2).toEqual(expectedData);
    });

    it('should compress large financial profiles effectively', () => {
      const largeProfile = {
        // Create a profile with lots of data to test compression
        propertyAssets: 1500000,
        savings: 400000,
        mortgageBalance: 750000,
        mortgageRate: 0.0625,
        superannuationBalance: 250000,
        superannuationRate: 0.08,
        salary: 160000,
        partnerSalary: 130000,
        expenses: 110000,
        currentAge: 42,
        retireAge: 67,
        deathAge: 95,
        partnerAge: 39,
        partnerRetireAge: 65,
        savingsGrowthRate: 0.03,
        propertyGrowthRate: 0.035,
        propertyRentalYield: 0.04,
        cpiGrowthRate: 0.028,
        pensionAmount: 25000,
        partnerPensionAmount: 25000,
        relationshipStatus: 'couple' as const,
        isHomeowner: true,
        notes: 'This is a test profile with extensive financial data to verify compression effectiveness'
      };

      const encrypted = compressAndEncryptForUrl(largeProfile);
      
      expect(encrypted).not.toBeNull();
      
      // With new optimizations, URLs should be much shorter (target < 1000 chars)
      expect(encrypted!.length).toBeLessThan(1000);
      
      // Should still decrypt correctly, adding any missing defaults
      const decrypted = decryptAndDecompressFromUrl<typeof largeProfile>(encrypted!);
      const expectedProfile = {
        ...largeProfile,
        // Add any defaults that weren't in the original profile
        pensionStartAge: 67 // This is the only default not included in the large profile
      };
      expect(decrypted).toEqual(expectedProfile);
    });

    it('should achieve significant compression with data minimization', () => {
      // Profile with mostly default values
      const profileWithDefaults = {
        salary: 100000,  // Only meaningful non-default value
        expenses: 60000, // Only meaningful non-default value
        currentAge: 30,  // Default value
        retireAge: 65,   // Default value
        deathAge: 90,    // Default value
        savingsGrowthRate: 0.025, // Default value
        propertyGrowthRate: 0.03, // Default value
        relationshipStatus: 'single' as const, // Default value
        isHomeowner: true, // Default value
        propertyAssets: 0, // Default value
        savings: 0,        // Default value
      };

      const encrypted = compressAndEncryptForUrl(profileWithDefaults);
      expect(encrypted).not.toBeNull();
      
      // Should be very short due to data minimization (most values are defaults)
      expect(encrypted!.length).toBeLessThan(300);
      
      // Should decrypt to full profile with ALL defaults restored, including additional defaults
      const decrypted = decryptAndDecompressFromUrl<typeof profileWithDefaults>(encrypted!);
      const expectedProfile = {
        ...profileWithDefaults,
        // Additional defaults that get restored
        mortgageBalance: 0,
        superannuationBalance: 0,
        partnerSalary: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65
      };
      expect(decrypted).toEqual(expectedProfile);
    });

    it('should handle profiles with no meaningful data', () => {
      // Profile with all default values
      const defaultProfile = {
        currentAge: 30,
        retireAge: 65,
        deathAge: 90,
        relationshipStatus: 'single' as const,
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        salary: 0,
        expenses: 0
      };

      const encrypted = compressAndEncryptForUrl(defaultProfile);
      expect(encrypted).not.toBeNull();
      
      // Should be extremely short (minimal non-default data)
      expect(encrypted!.length).toBeLessThan(200);
      
      const decrypted = decryptAndDecompressFromUrl<typeof defaultProfile>(encrypted!);
      // Should restore to complete profile with all defaults
      const expectedProfile = {
        ...defaultProfile,
        // Additional defaults that get restored
        mortgageBalance: 0,
        superannuationBalance: 0,
        partnerSalary: 0,
        pensionAmount: 0,
        partnerPensionAmount: 0,
        savingsGrowthRate: 0.025,
        propertyGrowthRate: 0.03,
        propertyRentalYield: 0.033,
        cpiGrowthRate: 0.03,
        mortgageRate: 0.06,
        superannuationRate: 0.07,
        pensionStartAge: 67,
        partnerAge: 30,
        partnerRetireAge: 65
      };
      expect(decrypted).toEqual(expectedProfile);
    });
  });
});