# Financial Planning Calculation Updates

## Overview
The financial planning system has been updated to separate assets into two distinct categories with different growth characteristics and withdrawal rules.

## Asset Types

### 1. Property Assets
- **Growth Rate**: Historic average property appreciation (default: 3% annually)
- **Characteristics**: 
  - Grows automatically each year
  - Cannot be used to pay expenses directly
  - More stable, long-term growth

### 2. Financial Assets  
- **Growth Rate**: User-defined investment return rate
- **Characteristics**:
  - Grows based on user's investment strategy
  - Used to pay all living expenses
  - Receives annual salary additions
  - Can be depleted to zero if expenses exceed income + growth

## Calculation Logic

### Annual Calculation Process:
1. **Apply Growth Rates**:
   - Property Assets: `PropertyAssets × (1 + PropertyGrowthRate)`
   - Financial Assets: `FinancialAssets × (1 + FinancialAssetGrowthRate)`

2. **Add Income**:
   - Salary is added to Financial Assets only
   - **NEW**: Salary income stops at retirement age

3. **Subtract Expenses**:
   - All expenses are deducted from Financial Assets only
   - Financial Assets cannot go below $0

4. **Calculate Total Wealth**:
   - Total Wealth = Property Assets + Financial Assets

## Retirement Age Consideration

The system now includes a retirement age parameter that affects net wealth calculations:

- **Before Retirement Age**: Full salary is added to financial assets each year
- **At/After Retirement Age**: No salary income is added to financial assets
- **Expenses**: Continue throughout the entire projection period
- **Asset Growth**: Both property and financial assets continue to grow throughout retirement

This provides a more realistic projection by accounting for the transition from working years to retirement years.

## Inflation Adjustment

The system now includes inflation adjustment to show both nominal and real (inflation-adjusted) values:

- **Nominal Values**: The actual dollar amounts projected for future years
- **Real Values**: The purchasing power of those dollars in today's terms
- **Default Inflation Rate**: 3% annually (user configurable)
- **Calculation**: Real Value = Nominal Value ÷ (1 + inflation rate)^years

### Benefits of Inflation Adjustment:
- **Better Financial Planning**: Shows what your money will actually be worth
- **Realistic Expectations**: Accounts for the declining value of money over time  
- **Comparable Values**: All projections shown in today's purchasing power
- **Informed Decisions**: Helps set appropriate savings and investment goals

## Example Scenario

**Starting Values (Age 30):**
- Property Assets: $500,000
- Financial Assets: $100,000
- Annual Salary: $80,000
- Annual Expenses: $60,000
- Property Growth Rate: 3%
- Financial Asset Growth Rate: 7%
- **Retirement Age: 65**
- **Inflation Rate: 3%**

**Year 1 (Age 31):**
- Property Assets: $500,000 × 1.03 = $515,000
- Financial Assets: ($100,000 × 1.07) + $80,000 - $60,000 = $127,000
- Total Wealth: $642,000
- **Inflation-Adjusted Wealth**: $642,000 ÷ 1.03 = $623,301 *(in today's purchasing power)*

**Year 35 (Age 65 - Retirement Year):**
- Property Assets: [Previous Value] × 1.03
- Financial Assets: ([Previous Value] × 1.07) + $80,000 - $60,000 = [Value]
- Total Wealth: [Property + Financial]
- **Inflation-Adjusted Wealth**: [Nominal] ÷ (1.03)^35 *(in today's purchasing power)*

**Year 36 (Age 66 - First Retirement Year):**
- Property Assets: [Previous Value] × 1.03
- Financial Assets: ([Previous Value] × 1.07) + $0 - $60,000 = [Value] *(No salary added)*
- Total Wealth: [Property + Financial]
- **Inflation-Adjusted Wealth**: [Nominal] ÷ (1.03)^36 *(in today's purchasing power)*

## Key Benefits

1. **Realistic Asset Separation**: Property and financial assets behave differently in real life
2. **Expense Management**: Only liquid financial assets can pay for living expenses
3. **Growth Rate Flexibility**: Users can input their expected investment returns
4. **Risk Management**: Protects against scenarios where expenses exceed available liquid funds

## API Changes

### FinancialProfile Model
```csharp
public class FinancialProfile
{
    // Replaced single 'Assets' property with:
    public decimal PropertyAssets { get; set; }
    public decimal FinancialAssets { get; set; }
    
    // Age considerations:
    public int CurrentAge { get; set; }
    public int RetireAge { get; set; } // NEW: Age when salary stops
    public int DeathAge { get; set; }
    
    // Added growth rate configurations:
    public decimal FinancialAssetGrowthRate { get; set; } // User input
    public decimal PropertyGrowthRate { get; set; } = 0.03m; // Default 3%
    public decimal InflationRate { get; set; } = 0.03m; // NEW: Default 3% inflation
}
```

### YearlyWealthDto
```csharp
public class YearlyWealthDto
{
    public int Age { get; set; }
    public decimal Wealth { get; set; }
    public decimal PropertyAssets { get; set; } // New
    public decimal FinancialAssets { get; set; } // New
}
```

This update provides a more realistic and sophisticated financial planning model that better reflects how different asset types behave in real-world scenarios.
