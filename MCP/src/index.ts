import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { calculateRetirementPlan } from './tools/calculateRetirementPlan.js';
import { optimizeExpense, findOptimalExpense } from './tools/optimizeExpense.js';
import type { FinancialProfile } from './types.js';

const server = new McpServer({
  name: 'retirement-planner',
  version: '1.0.0'
});

// Shared Zod schema for FinancialProfile input
const lifeEventSchema = z.object({
  id: z.string(),
  label: z.string(),
  age: z.number(),
  amount: z.number(),
  type: z.enum(['expense', 'income'])
});

const housePurchasePlanSchema = z.object({
  enabled: z.boolean(),
  purchaseAge: z.number(),
  purchasePrice: z.number(),
  downPaymentPercent: z.number()
});

const financialProfileSchema = z.object({
  propertyAssets: z.number().describe('Current property asset value in dollars'),
  savings: z.number().describe('Current savings/cash balance in dollars'),
  mortgageBalance: z.number().describe('Outstanding mortgage balance in dollars'),
  superannuationBalance: z.number().describe('Superannuation (retirement fund) balance in dollars'),
  partnerSuperBalance: z.number().optional().describe('Partner superannuation balance in dollars'),

  mortgageRate: z.number().describe('Annual mortgage interest rate as decimal (e.g. 0.06 for 6%)'),
  superannuationRate: z.number().describe('Annual superannuation return rate as decimal (e.g. 0.07 for 7%)'),
  savingsGrowthRate: z.number().describe('Annual savings/investment growth rate as decimal'),
  propertyGrowthRate: z.number().describe('Annual property growth rate as decimal (e.g. 0.04 for 4%)'),
  propertyRentalYield: z.number().describe('Net rental yield as decimal (e.g. 0.03 for 3%)'),
  cpiGrowthRate: z.number().describe('Annual CPI/inflation rate as decimal (e.g. 0.025 for 2.5%)'),

  salary: z.number().describe('Annual gross salary package including super'),
  partnerSalary: z.number().describe('Partner annual gross salary package including super'),
  expenses: z.number().describe('Annual living expenses in dollars'),

  currentAge: z.number().describe('Current age in years'),
  retireAge: z.number().describe('Planned retirement age'),
  deathAge: z.number().describe('Age to project plan until (plan end age)'),
  partnerAge: z.number().describe('Partner current age'),
  partnerRetireAge: z.number().describe('Partner planned retirement age'),
  relationshipStatus: z.enum(['single', 'couple']).describe('Relationship status'),
  isHomeowner: z.boolean().describe('Whether the person owns their home'),

  pensionAmount: z.number().describe('Expected annual pension amount'),
  pensionStartAge: z.number().describe('Age when pension starts'),
  partnerPensionAmount: z.number().describe('Partner expected annual pension amount'),
  partnerPensionStartAge: z.number().describe('Age when partner pension starts'),
  lifeEvents: z.array(lifeEventSchema).optional().describe('One-off financial events'),
  housePurchasePlan: housePurchasePlanSchema.optional().describe('Future house purchase plan')
});

// Tool: calculate-retirement-plan
server.tool(
  'calculate-retirement-plan',
  'Calculate a complete retirement financial plan with year-by-year projections including income, expenses, assets, superannuation, pension, and inflation-adjusted wealth.',
  { profile: financialProfileSchema },
  async ({ profile }) => {
    try {
      const result = calculateRetirementPlan(profile as FinancialProfile);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: result.summary,
            finalWealth: result.finalWealth,
            finalNetSavings: result.finalNetSavings,
            projectionYears: result.projection.length,
            projection: result.projection
          }, null, 2)
        }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: 'Calculation error: ' + message }],
        isError: true
      };
    }
  }
);

// Tool: optimize-expense
server.tool(
  'optimize-expense',
  'Find the optimal annual expense that would deplete wealth to approximately zero at the plan end age (death age). Uses binary search optimization with cash flow sustainability checks.',
  { profile: financialProfileSchema },
  async ({ profile }) => {
    try {
      const result = optimizeExpense(profile as FinancialProfile);
      const quickResult = findOptimalExpense(profile as FinancialProfile);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            optimalAnnualExpense: result.optimalExpense,
            optimalMonthlyExpense: Math.round(result.optimalExpense / 12),
            quickEstimate: quickResult,
            finalWealthAtDeath: result.finalWealth,
            optimizationIterations: result.iterations,
            converged: result.converged
          }, null, 2)
        }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: 'Optimization error: ' + message }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Retirement Planner MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
