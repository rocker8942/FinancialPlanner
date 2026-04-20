import { setSecureItem, getSecureItem } from '../utils/encryption';
import { generateShareableUrl } from '../utils/formatters';
import type { FinancialProfile } from '../utils/financialPlan';
import type { LifeEvent, HousePurchasePlan } from '../utils/models/FinancialTypes';

// Storage keys
const LOCAL_STORAGE_KEY = 'financialPlannerData';
const AUTO_SAVE_DEBOUNCE_MS = 500;

// Storage interface matching the current form structure
export interface StoredFinancialData {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  mortgageRate: number;
  superannuationBalance: number;
  partnerSuperBalance?: number;
  superannuationRate: number;
  salary: number;
  partnerSalary: number;
  expenses: number;
  currentAge: number;
  retireAge: number;
  deathAge: number;
  savingsGrowthRate: number;
  propertyGrowthRate: number;
  propertyRentalYield: number;
  cpiGrowthRate: number;
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
  partnerAge: number;
  partnerRetireAge: number;
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
  zeroNetWorthAtDeath?: boolean;
  lifeEvents?: LifeEvent[];
  housePurchasePlan?: HousePurchasePlan;
  krPensionBalance?: number;
}

export class FormStorageService {
  private autoSaveTimeout: number | null = null;
  
  /**
   * Save form data to encrypted local storage
   */
  saveToStorage(data: StoredFinancialData): void {
    try {
      setSecureItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
  
  /**
   * Load form data from encrypted local storage
   */
  loadFromStorage(): StoredFinancialData | null {
    try {
      const data = getSecureItem<StoredFinancialData>(LOCAL_STORAGE_KEY);
      return data;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Auto-save with debouncing to prevent excessive writes
   */
  autoSave(data: StoredFinancialData): void {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    // Set new timeout for debounced save
    this.autoSaveTimeout = window.setTimeout(() => {
      this.saveToStorage(data);
      this.autoSaveTimeout = null;
    }, AUTO_SAVE_DEBOUNCE_MS);
  }
  
  /**
   * Convert form fields to storage format
   */
  fieldsToStorageData(fields: Record<string, any>): StoredFinancialData {
    return {
      propertyAssets: fields.propertyAssets || 0,
      savings: fields.savings || 0,
      mortgageBalance: fields.mortgageBalance || 0,
      mortgageRate: fields.mortgageRate || 0.06,
      superannuationBalance: fields.superannuationBalance || 0,
      partnerSuperBalance: fields.partnerSuperBalance || 0,
      superannuationRate: fields.superannuationRate || 0.07,
      salary: fields.salary || 0,
      partnerSalary: fields.partnerSalary || 0,
      expenses: fields.expenses || 0,
      currentAge: fields.currentAge || 30,
      retireAge: fields.retireAge || 65,
      deathAge: fields.deathAge || 90,
      savingsGrowthRate: fields.savingsGrowthRate || 0.025,
      propertyGrowthRate: fields.propertyGrowthRate || 0.03,
      propertyRentalYield: fields.propertyRentalYield || 0.033,
      cpiGrowthRate: fields.cpiGrowthRate || 0.03,
      pensionAmount: fields.pensionAmount || 0,
      pensionStartAge: fields.pensionStartAge || 67,
      partnerPensionAmount: fields.partnerPensionAmount || 0,
      partnerPensionStartAge: fields.partnerPensionStartAge || 67,
      partnerAge: fields.partnerAge || 30,
      partnerRetireAge: fields.partnerRetireAge || 65,
      relationshipStatus: fields.relationshipStatus || 'single',
      isHomeowner: fields.isHomeowner || false,
      lifeEvents: fields.lifeEvents || []
    };
  }
  
  /**
   * Convert storage data back to form fields
   */
  storageDataToFields(data: StoredFinancialData): Record<string, any> {
    return {
      propertyAssets: data.propertyAssets,
      savings: data.savings,
      mortgageBalance: data.mortgageBalance,
      mortgageRate: data.mortgageRate,
      superannuationBalance: data.superannuationBalance,
      partnerSuperBalance: data.partnerSuperBalance ?? 0,
      superannuationRate: data.superannuationRate,
      salary: data.salary,
      partnerSalary: data.partnerSalary,
      expenses: data.expenses,
      currentAge: data.currentAge,
      retireAge: data.retireAge,
      deathAge: data.deathAge,
      savingsGrowthRate: data.savingsGrowthRate,
      propertyGrowthRate: data.propertyGrowthRate,
      propertyRentalYield: data.propertyRentalYield,
      cpiGrowthRate: data.cpiGrowthRate,
      pensionAmount: data.pensionAmount,
      pensionStartAge: data.pensionStartAge,
      partnerPensionAmount: data.partnerPensionAmount,
      partnerPensionStartAge: data.partnerPensionStartAge,
      partnerAge: data.partnerAge,
      partnerRetireAge: data.partnerRetireAge,
      relationshipStatus: data.relationshipStatus,
      isHomeowner: data.isHomeowner,
      lifeEvents: data.lifeEvents ?? []
    };
  }

  /**
   * Convert storage data to FinancialProfile for calculations
   */
  storageDataToFinancialProfile(data: StoredFinancialData): FinancialProfile {
    return {
      propertyAssets: data.propertyAssets,
      savings: data.savings,
      mortgageBalance: data.mortgageBalance,
      mortgageRate: data.mortgageRate,
      superannuationBalance: data.superannuationBalance,
      partnerSuperBalance: data.partnerSuperBalance ?? 0,
      superannuationRate: data.superannuationRate,
      salary: data.salary,
      partnerSalary: data.partnerSalary,
      expenses: data.expenses,
      currentAge: data.currentAge,
      retireAge: data.retireAge,
      deathAge: data.deathAge,
      savingsGrowthRate: data.savingsGrowthRate,
      propertyGrowthRate: data.propertyGrowthRate,
      propertyRentalYield: data.propertyRentalYield,
      cpiGrowthRate: data.cpiGrowthRate,
      partnerAge: data.partnerAge,
      partnerRetireAge: data.partnerRetireAge,
      relationshipStatus: data.relationshipStatus,
      isHomeowner: data.isHomeowner,
      lifeEvents: data.lifeEvents ?? []
    };
  }

  /**
   * Generate shareable URL from current data
   */
  async generateShareableUrl(data: StoredFinancialData): Promise<string> {
    const profile = this.storageDataToFinancialProfile(data);
    return generateShareableUrl(profile);
  }
  
  /**
   * Copy shareable URL to clipboard
   */
  async copyShareableUrl(data: StoredFinancialData): Promise<boolean> {
    try {
      const shareableUrl = await this.generateShareableUrl(data);
      await navigator.clipboard.writeText(shareableUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Clear all stored data
   */
  clearStorage(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
  
  /**
   * Check if we have any saved data
   */
  hasSavedData(): boolean {
    try {
      const data = this.loadFromStorage();
      return data !== null;
    } catch {
      return false;
    }
  }
  
  /**
   * Get default form values
   */
  getDefaultValues(): StoredFinancialData {
    return {
      propertyAssets: 0,
      savings: 0,
      mortgageBalance: 0,
      mortgageRate: 0.06, // 6%
      superannuationBalance: 0,
      partnerSuperBalance: 0,
      superannuationRate: 0.07, // 7%
      salary: 0,
      partnerSalary: 0,
      expenses: 0,
      currentAge: 30,
      retireAge: 65,
      deathAge: 90,
      savingsGrowthRate: 0.025, // 2.5%
      propertyGrowthRate: 0.03, // 3%
      propertyRentalYield: 0.033, // 3.3%
      cpiGrowthRate: 0.03, // 3%
      pensionAmount: 0,
      pensionStartAge: 67,
      partnerPensionAmount: 0,
      partnerPensionStartAge: 67,
      partnerAge: 30,
      partnerRetireAge: 65,
      relationshipStatus: 'single',
      isHomeowner: false,
      zeroNetWorthAtDeath: false,
      lifeEvents: []
    };
  }
  
  /**
   * Load data or return defaults if none exists
   */
  loadOrDefault(): StoredFinancialData {
    const saved = this.loadFromStorage();
    return saved || this.getDefaultValues();
  }
  
  /**
   * Cancel any pending auto-save
   */
  cancelAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }
}

// Export singleton instance
export const formStorageService = new FormStorageService();