export type RelationshipStatus = 'single' | 'couple';
export interface AgePensionParams {
    relationshipStatus: RelationshipStatus;
    isHomeowner: boolean;
    propertyAssets: number;
    financialAssets: number;
    annualIncome: number;
    partnerAnnualIncome?: number;
    age: number;
    partnerAge?: number;
    cpiAdjustmentFactor?: number;
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
export declare function calculateAgePension(params: AgePensionParams): AgePensionResult;
export interface AgePensionAmountsInput {
    relationshipStatus: RelationshipStatus;
    isHomeowner: boolean;
    propertyAssets: number;
    savings: number;
    superannuation: number;
    mortgageBalance: number;
    userSalary: number;
    partnerSalary: number;
    userAge: number;
    partnerAge: number;
    cpiAdjustmentFactor?: number;
    partnerSuperBalance?: number;
}
export declare function getAgePensionAmounts(input: AgePensionAmountsInput): {
    userPension: number;
    partnerPension: number;
};
//# sourceMappingURL=pensionService.d.ts.map