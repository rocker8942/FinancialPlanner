// Australian Age Pension calculation service
// Based on 2025 rates and thresholds

export type RelationshipStatus = 'single' | 'couple';

export interface AgePensionParams {
  relationshipStatus: RelationshipStatus;
  isHomeowner: boolean;
  propertyAssets: number;
  financialAssets: number; // savings + superannuation - mortgage
  annualIncome: number; // salary income (excluding deemed income)
  partnerAnnualIncome?: number; // only for couples
  age: number;
  partnerAge?: number; // only for couples
  cpiAdjustmentFactor?: number; // multiplier to adjust thresholds for inflation (defaults to 1.0)
}

export interface AgePensionResult {
  userPensionAmount: number;
  partnerPensionAmount: number;
  totalPensionAmount: number;
  assetTestResult: {
    totalAssets: number;
    threshold: number;
    reduction: number;
    passesTest: boolean;
  };
  incomeTestResult: {
    totalIncome: number;
    deemedIncome: number;
    threshold: number;
    reduction: number;
    passesTest: boolean;
  };
  finalTest: 'asset' | 'income';
}

// 2025 Australian Age Pension rates and thresholds (base year)
const PENSION_RATES = {
  single: {
    fullPension: 29874, // Annual amount
    maxPension: 29874
  },
  couple: {
    fullPensionCombined: 45037, // Annual amount for both partners
    maxPensionCombined: 45037,
    fullPensionEach: 22519 // Each partner gets this amount when both eligible
  }
};

// Base asset test thresholds for 2025 (will be adjusted for inflation)
const BASE_ASSET_TEST_THRESHOLDS = {
  single: {
    homeowner: {
      fullPension: 321500,
      cutOff: 704500
    },
    nonHomeowner: {
      fullPension: 579500,
      cutOff: 962500
    }
  },
  couple: {
    homeowner: {
      fullPension: 481500,
      cutOff: 1059000
    },
    nonHomeowner: {
      fullPension: 739500,
      cutOff: 1317000
    }
  }
};

// Helper function to get CPI-adjusted asset test thresholds
function getAdjustedAssetTestThresholds(cpiAdjustmentFactor: number = 1.0) {
  const adjusted = JSON.parse(JSON.stringify(BASE_ASSET_TEST_THRESHOLDS)); // Deep copy
  
  // Apply CPI adjustment to all threshold values
  adjusted.single.homeowner.fullPension = Math.round(adjusted.single.homeowner.fullPension * cpiAdjustmentFactor);
  adjusted.single.homeowner.cutOff = Math.round(adjusted.single.homeowner.cutOff * cpiAdjustmentFactor);
  adjusted.single.nonHomeowner.fullPension = Math.round(adjusted.single.nonHomeowner.fullPension * cpiAdjustmentFactor);
  adjusted.single.nonHomeowner.cutOff = Math.round(adjusted.single.nonHomeowner.cutOff * cpiAdjustmentFactor);
  
  adjusted.couple.homeowner.fullPension = Math.round(adjusted.couple.homeowner.fullPension * cpiAdjustmentFactor);
  adjusted.couple.homeowner.cutOff = Math.round(adjusted.couple.homeowner.cutOff * cpiAdjustmentFactor);
  adjusted.couple.nonHomeowner.fullPension = Math.round(adjusted.couple.nonHomeowner.fullPension * cpiAdjustmentFactor);
  adjusted.couple.nonHomeowner.cutOff = Math.round(adjusted.couple.nonHomeowner.cutOff * cpiAdjustmentFactor);
  
  return adjusted;
}

const INCOME_TEST_THRESHOLDS = {
  single: {
    freeArea: 5668, // Annual ($218 * 26 fortnights)
    cutOff: 65416 // Annual ($2516 * 26 fortnights)
  },
  couple: {
    freeAreaCombined: 9880, // Annual ($380 * 26 fortnights)
    cutOffCombined: 99954 // Annual ($3844.40 * 26 fortnights)
  }
};

// Deeming rates for financial assets (2025)
const DEEMING_RATES = {
  single: {
    lowerThreshold: 62600,
    lowerRate: 0.0225, // 2.25%
    upperRate: 0.04 // 4.0%
  },
  couple: {
    lowerThreshold: 103800,
    lowerRate: 0.0225, // 2.25%
    upperRate: 0.04 // 4.0%
  }
};

// Asset test reduction: $3 per fortnight for every $1,000 over threshold
// Convert to annual: $3 * 26 = $78 per $1,000
const ASSET_REDUCTION_RATE = 78 / 1000; // $78 per $1000 excess assets

// Income test reduction rates (annual equivalents)
const INCOME_REDUCTION_RATES = {
  single: 0.5, // 50 cents per dollar over threshold
  couple: 0.25 // 25 cents per dollar over threshold per partner
};

function calculateDeemedIncome(financialAssets: number, relationshipStatus: RelationshipStatus): number {
  const rates = DEEMING_RATES[relationshipStatus];
  
  if (financialAssets <= rates.lowerThreshold) {
    return financialAssets * rates.lowerRate;
  } else {
    const lowerPortionIncome = rates.lowerThreshold * rates.lowerRate;
    const upperPortionIncome = (financialAssets - rates.lowerThreshold) * rates.upperRate;
    return lowerPortionIncome + upperPortionIncome;
  }
}

function calculateAssetTest(params: AgePensionParams): AgePensionResult['assetTestResult'] {
  const { relationshipStatus, isHomeowner, propertyAssets, financialAssets, cpiAdjustmentFactor = 1.0 } = params;
  
  const totalAssets = propertyAssets + Math.max(0, financialAssets);
  const adjustedThresholds = getAdjustedAssetTestThresholds(cpiAdjustmentFactor);
  const thresholds = adjustedThresholds[relationshipStatus][isHomeowner ? 'homeowner' : 'nonHomeowner'];
  
  if (totalAssets <= thresholds.fullPension) {
    return {
      totalAssets,
      threshold: thresholds.fullPension,
      reduction: 0,
      passesTest: true
    };
  }
  
  if (totalAssets >= thresholds.cutOff) {
    return {
      totalAssets,
      threshold: thresholds.fullPension,
      reduction: relationshipStatus === 'single' ? PENSION_RATES.single.maxPension : PENSION_RATES.couple.maxPensionCombined,
      passesTest: false
    };
  }
  
  const excessAssets = totalAssets - thresholds.fullPension;
  const reduction = excessAssets * ASSET_REDUCTION_RATE;
  
  return {
    totalAssets,
    threshold: thresholds.fullPension,
    reduction,
    passesTest: true
  };
}

function calculateIncomeTest(params: AgePensionParams): AgePensionResult['incomeTestResult'] {
  const { relationshipStatus, financialAssets, annualIncome, partnerAnnualIncome = 0 } = params;
  
  const deemedIncome = calculateDeemedIncome(Math.max(0, financialAssets), relationshipStatus);
  const totalIncome = relationshipStatus === 'couple' 
    ? annualIncome + partnerAnnualIncome + deemedIncome
    : annualIncome + deemedIncome;
  
  const thresholds = INCOME_TEST_THRESHOLDS[relationshipStatus];
  const freeArea = relationshipStatus === 'couple' 
    ? (thresholds as typeof INCOME_TEST_THRESHOLDS.couple).freeAreaCombined 
    : (thresholds as typeof INCOME_TEST_THRESHOLDS.single).freeArea;
  const cutOff = relationshipStatus === 'couple' 
    ? (thresholds as typeof INCOME_TEST_THRESHOLDS.couple).cutOffCombined 
    : (thresholds as typeof INCOME_TEST_THRESHOLDS.single).cutOff;
  
  if (totalIncome <= freeArea) {
    return {
      totalIncome,
      deemedIncome,
      threshold: freeArea,
      reduction: 0,
      passesTest: true
    };
  }
  
  if (totalIncome >= cutOff) {
    return {
      totalIncome,
      deemedIncome,
      threshold: freeArea,
      reduction: relationshipStatus === 'single' ? PENSION_RATES.single.maxPension : PENSION_RATES.couple.maxPensionCombined,
      passesTest: false
    };
  }
  
  const excessIncome = totalIncome - freeArea;
  const reduction = excessIncome * INCOME_REDUCTION_RATES[relationshipStatus];
  
  return {
    totalIncome,
    deemedIncome,
    threshold: freeArea,
    reduction,
    passesTest: true
  };
}

export function calculateAgePension(params: AgePensionParams): AgePensionResult {
  const { relationshipStatus, age, partnerAge = 0 } = params;
  
  // Check eligibility (must be 67 or older)
  const userEligible = age >= 67;
  const partnerEligible = relationshipStatus === 'couple' ? partnerAge >= 67 : false;
  
  if (!userEligible && !partnerEligible) {
    return {
      userPensionAmount: 0,
      partnerPensionAmount: 0,
      totalPensionAmount: 0,
      assetTestResult: {
        totalAssets: 0,
        threshold: 0,
        reduction: 0,
        passesTest: false
      },
      incomeTestResult: {
        totalIncome: 0,
        deemedIncome: 0,
        threshold: 0,
        reduction: 0,
        passesTest: false
      },
      finalTest: 'income'
    };
  }
  
  const assetTestResult = calculateAssetTest(params);
  const incomeTestResult = calculateIncomeTest(params);
  
  // The test that results in the lower pension amount applies
  const assetTestPension = relationshipStatus === 'single' 
    ? Math.max(0, PENSION_RATES.single.fullPension - assetTestResult.reduction)
    : Math.max(0, PENSION_RATES.couple.fullPensionCombined - assetTestResult.reduction);
    
  const incomeTestPension = relationshipStatus === 'single'
    ? Math.max(0, PENSION_RATES.single.fullPension - incomeTestResult.reduction)
    : Math.max(0, PENSION_RATES.couple.fullPensionCombined - incomeTestResult.reduction);
  
  const finalPensionAmount = Math.min(assetTestPension, incomeTestPension);
  const finalTest = assetTestPension <= incomeTestPension ? 'asset' : 'income';
  
  // Calculate individual amounts based on eligibility
  let userPensionAmount = 0;
  let partnerPensionAmount = 0;
  
  if (relationshipStatus === 'single') {
    userPensionAmount = userEligible ? finalPensionAmount : 0;
  } else {
    // For couples, split the pension based on who is eligible
    if (userEligible && partnerEligible) {
      userPensionAmount = finalPensionAmount / 2;
      partnerPensionAmount = finalPensionAmount / 2;
    } else if (userEligible) {
      // Only user eligible - they get single pension rate instead
      const singleParams = { ...params, relationshipStatus: 'single' as RelationshipStatus };
      const singleResult = calculateAgePension(singleParams);
      userPensionAmount = singleResult.userPensionAmount;
      partnerPensionAmount = 0;
    } else if (partnerEligible) {
      // Only partner eligible - they get single pension rate instead
      const singleParams = { ...params, relationshipStatus: 'single' as RelationshipStatus };
      const singleResult = calculateAgePension(singleParams);
      userPensionAmount = 0;
      partnerPensionAmount = singleResult.userPensionAmount;
    }
  }
  
  return {
    userPensionAmount,
    partnerPensionAmount,
    totalPensionAmount: userPensionAmount + partnerPensionAmount,
    assetTestResult,
    incomeTestResult,
    finalTest
  };
}

// Helper function for easy integration with existing code
export function getAgePensionAmounts(
  relationshipStatus: RelationshipStatus,
  isHomeowner: boolean,
  propertyAssets: number,
  savings: number,
  superannuation: number,
  mortgageBalance: number,
  userSalary: number,
  partnerSalary: number,
  userAge: number,
  partnerAge: number,
  cpiAdjustmentFactor: number = 1.0
): { userPension: number; partnerPension: number } {
  
  const financialAssets = savings + superannuation - mortgageBalance;
  
  const result = calculateAgePension({
    relationshipStatus,
    isHomeowner,
    propertyAssets,
    financialAssets,
    annualIncome: userSalary,
    partnerAnnualIncome: partnerSalary,
    age: userAge,
    partnerAge,
    cpiAdjustmentFactor
  });
  
  return {
    userPension: result.userPensionAmount,
    partnerPension: result.partnerPensionAmount
  };
}