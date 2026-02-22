import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

// Generate a stable device-based key for client-side encryption (localStorage only)
// This provides protection against casual browsing but is not cryptographically secure
function generateSessionKey(): string {
  const userAgent = navigator.userAgent;
  const deviceId = localStorage.getItem('deviceId') || Math.random().toString(36);

  // Store device ID in localStorage so it persists across browser sessions
  if (!localStorage.getItem('deviceId')) {
    localStorage.setItem('deviceId', deviceId);
  }

  // Create a deterministic but device-specific key
  return CryptoJS.SHA256(userAgent + deviceId).toString();
}

// Generate an application-wide key for cross-device URL sharing
// Uses static application identifiers that work consistently across devices
function generateApplicationKey(): string {
  const appId = 'financial-planner-v1';
  const monthYear = new Date().toISOString().substring(0, 7); // YYYY-MM format (monthly rotation)
  
  // Create a deterministic key that works across all devices for the same month
  return CryptoJS.SHA256(appId + monthYear).toString();
}

/**
 * Encrypts sensitive data before storing in localStorage
 * @param data The data object to encrypt
 * @returns Encrypted string
 */
export function encryptSensitiveData<T>(data: T): string {
  // First, try to stringify the data to check for circular references
  let jsonString: string;
  try {
    jsonString = JSON.stringify(data);
  } catch (jsonError) {
    console.warn('Failed to encrypt data, storing unencrypted:', jsonError);
    return '{}'; // Return empty object JSON if stringify fails
  }

  try {
    const key = generateSessionKey();
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    
    // Add a prefix to identify encrypted data
    return 'encrypted:' + encrypted;
  } catch (error) {
    console.warn('Failed to encrypt data, storing unencrypted:', error);
    // If encryption fails but stringify worked, return the JSON string
    return jsonString;
  }
}

/**
 * Decrypts sensitive data from localStorage
 * @param encryptedData The encrypted string from localStorage
 * @returns Decrypted data object or null if decryption fails
 */
export function decryptSensitiveData<T>(encryptedData: string): T | null {
  try {
    // Check if data is encrypted
    if (!encryptedData.startsWith('encrypted:')) {
      // Legacy unencrypted data - parse as JSON
      return JSON.parse(encryptedData);
    }
    
    const key = generateSessionKey();
    const encryptedContent = encryptedData.substring('encrypted:'.length);
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      console.warn('Failed to decrypt data - key mismatch or corrupted data');
      return null;
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to decrypt data:', error);
    return null;
  }
}

/**
 * Securely stores sensitive data in localStorage with encryption
 * @param key The localStorage key
 * @param data The data to store
 */
export function setSecureItem<T>(key: string, data: T): void {
  const encrypted = encryptSensitiveData(data);
  localStorage.setItem(key, encrypted);
}

/**
 * Securely retrieves sensitive data from localStorage with decryption
 * @param key The localStorage key
 * @returns Decrypted data or null if not found or decryption fails
 */
export function getSecureItem<T>(key: string): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  return decryptSensitiveData<T>(stored);
}

/**
 * Removes sensitive data from localStorage
 * @param key The localStorage key
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Clears all encrypted financial data from localStorage
 */
export function clearAllSecureData(): void {
  // Remove known encrypted data keys
  removeSecureItem('financial-input');
  // Clear device key to invalidate any remaining encrypted data
  localStorage.removeItem('deviceId');
}

// URL-specific encryption functions for shareable links

// Default financial profile values for data minimization
const DEFAULT_FINANCIAL_PROFILE = {
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
  // Zero values that are typically defaults
  propertyAssets: 0,
  savings: 0,
  mortgageBalance: 0,
  superannuationBalance: 0,
  salary: 0,
  partnerSalary: 0,
  expenses: 0,
  pensionAmount: 0,
  partnerPensionAmount: 0
} as const;

/**
 * Minimizes data by removing default values to reduce URL length
 * @param data Original financial profile data
 * @returns Minimized data object with only non-default values
 */
function minimizeFinancialData(data: any): any {
  const minimized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const defaultValue = (DEFAULT_FINANCIAL_PROFILE as any)[key];
    
    // Only include if value differs from default
    if (defaultValue !== undefined && value !== defaultValue) {
      minimized[key] = value;
    } else if (defaultValue === undefined && value !== null && value !== undefined && value !== '') {
      // Include unknown fields that have meaningful values
      minimized[key] = value;
    }
  }
  
  return minimized;
}

/**
 * Restores minimized data by merging with default values
 * @param minimizedData Data with only non-default values
 * @returns Complete financial profile with defaults restored
 */
function restoreFinancialData(minimizedData: any): any {
  return {
    ...DEFAULT_FINANCIAL_PROFILE,
    ...minimizedData
  };
}

/**
 * Converts standard Base64 to clean URL-safe format
 * Replaces problematic characters and removes padding for shorter URLs
 */
function toCleanBase64(base64: string): string {
  return base64
    .replace(/\+/g, '-')    // Replace + with -
    .replace(/\//g, '_')    // Replace / with _
    .replace(/=/g, '');     // Remove padding
}

/**
 * Converts clean Base64 back to standard Base64
 * Restores original format for decryption
 */
function fromCleanBase64(cleanBase64: string): string {
  let base64 = cleanBase64
    .replace(/-/g, '+')     // Restore +
    .replace(/_/g, '/');    // Restore /
  
  // Add padding back if needed
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  
  return base64;
}

/**
 * Compression using LZ-string (optimized for browser environments)
 * @param jsonString The JSON string to compress
 * @returns Compressed string with format prefix
 */
function compressData(jsonString: string): string | null {
  try {
    // Use LZ-string compression (browser-optimized)
    const lzStringCompressed = LZString.compressToBase64(jsonString);
    if (lzStringCompressed) {
      return 'lzs:' + lzStringCompressed;
    }
  } catch (error) {
    console.warn('LZ-string compression failed:', error);
  }
  
  // If compression fails, return null
  return null;
}

/**
 * Decompresses data based on format prefix
 * @param compressedData Compressed data with format prefix
 * @returns Decompressed JSON string
 */
function decompressData(compressedData: string): string | null {
  try {
    if (compressedData.startsWith('lzma:')) {
      // Legacy LZMA format - no longer supported, return null to trigger fallback
      console.warn('LZMA format detected but no longer supported, please regenerate URL');
      return null;
    } else if (compressedData.startsWith('lzs:')) {
      // LZ-string format  
      const lzStringData = compressedData.substring(4);
      return LZString.decompressFromBase64(lzStringData);
    } else {
      // Legacy LZ-string format (no prefix)
      return LZString.decompressFromBase64(compressedData);
    }
  } catch (error) {
    console.warn('Decompression failed:', error);
    return null;
  }
}

/**
 * Compresses and encrypts financial data for secure URL sharing
 * @param data Financial profile data to encrypt
 * @returns URL-safe encrypted string or null if encryption fails
 */
export function compressAndEncryptForUrl<T>(data: T): string | null {
  try {
    // Step 1: Minimize data by removing default values (major size reduction)
    const minimizedData = minimizeFinancialData(data);
    
    // Step 2: Convert minimized data to JSON
    let jsonString: string;
    try {
      jsonString = JSON.stringify(minimizedData);
    } catch (jsonError) {
      console.warn('Failed to serialize data to JSON:', jsonError);
      return null;
    }
    
    // Step 3: Compress using LZ-string (browser-optimized)
    const compressed = compressData(jsonString);
    if (!compressed) {
      console.warn('Failed to compress data for URL');
      return null;
    }
    
    // Step 4: Encrypt compressed data using application key for cross-device compatibility
    const key = generateApplicationKey();
    const encrypted = CryptoJS.AES.encrypt(compressed, key).toString();
    
    // Step 5: Convert to clean URL-safe format (no special chars/padding)
    const cleanEncoded = toCleanBase64(encrypted);
    
    return cleanEncoded;
  } catch (error) {
    console.warn('Failed to compress and encrypt data for URL:', error);
    return null;
  }
}

/**
 * Decrypts and decompresses financial data from URL fragment
 * @param encryptedData URL-safe encrypted string
 * @returns Decrypted and decompressed data or null if decryption fails
 */
export function decryptAndDecompressFromUrl<T>(encryptedData: string): T | null {
  // Step 1: Convert from clean Base64 format back to standard Base64
  const base64Data = fromCleanBase64(encryptedData);
  
  // Try decryption with application key first (new format for cross-device compatibility)
  try {
    const appKey = generateApplicationKey();
    const decrypted = CryptoJS.AES.decrypt(base64Data, appKey);
    const compressed = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (compressed) {
      // Step 3: Decompress using LZ-string (handles multiple formats)
      const jsonString = decompressData(compressed);
      if (jsonString) {
        // Step 4: Parse JSON and restore minimized data
        const minimizedData = JSON.parse(jsonString);
        
        // Step 5: Restore full data by merging with defaults
        const restoredData = restoreFinancialData(minimizedData);
        
        return restoredData as T;
      }
    }
  } catch (error) {
    console.warn('Failed to decrypt with application key, trying session key:', error);
  }
  
  // Fallback: Try decryption with session key (old format for backward compatibility)
  try {
    const sessionKey = generateSessionKey();
    const decrypted = CryptoJS.AES.decrypt(base64Data, sessionKey);
    const compressed = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (compressed) {
      // Step 3: Decompress using LZ-string (handles multiple formats)
      const jsonString = decompressData(compressed);
      if (jsonString) {
        // Step 4: Parse JSON and restore minimized data
        const minimizedData = JSON.parse(jsonString);
        
        // Step 5: Restore full data by merging with defaults
        const restoredData = restoreFinancialData(minimizedData);
        
        console.warn('Successfully decrypted with legacy session key - URL should be regenerated for cross-device compatibility');
        return restoredData as T;
      }
    }
  } catch (error) {
    console.warn('Failed to decrypt with both application and session keys:', error);
  }
  
  // Both decryption attempts failed
  console.warn('Failed to decrypt URL data - unable to decrypt with any key');
  return null;
}

/**
 * Generates a secure shareable URL with encrypted financial data
 * @param data Financial profile data
 * @param baseUrl Base URL for the application
 * @returns Secure URL with encrypted fragment or fallback URL
 */
export function generateSecureShareableUrl<T>(data: T, baseUrl: string): string {
  const encryptedData = compressAndEncryptForUrl(data);
  
  if (encryptedData) {
    return `${baseUrl}#enc:${encryptedData}`;
  }
  
  // Fallback to base URL if encryption fails
  console.warn('Failed to create encrypted URL, using base URL');
  return baseUrl;
}

/**
 * Parses encrypted financial data from URL fragment
 * @param fragment URL fragment (everything after #)
 * @returns Parsed financial data or null if parsing fails
 */
export function parseSecureUrlFragment<T>(fragment: string): T | null {
  if (!fragment || !fragment.startsWith('enc:')) {
    return null;
  }
  
  const encryptedData = fragment.substring(4); // Remove 'enc:' prefix
  return decryptAndDecompressFromUrl<T>(encryptedData);
}