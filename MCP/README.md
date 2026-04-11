# retirement-planner-mcp

An MCP (Model Context Protocol) server that exposes Australian retirement financial planning calculations. Connect it to Claude Desktop, Cursor, or any MCP-compatible client to run retirement projections and expense optimizations directly from your AI assistant.

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "retirement-planner": {
      "command": "npx",
      "args": ["-y", "retirement-planner-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "retirement-planner": {
      "command": "npx",
      "args": ["-y", "retirement-planner-mcp"]
    }
  }
}
```

Restart your client after saving the config. The tools will appear automatically.

---

## Tools

### `calculate-retirement-plan`

Calculates a complete retirement financial plan with year-by-year projections covering income, expenses, superannuation growth, age pension eligibility, property equity, and inflation-adjusted net wealth.

**Returns:** summary, final wealth, final net savings, and a full year-by-year projection array.

### `optimize-expense`

Finds the optimal annual (and monthly) living expense that depletes wealth to approximately zero by the plan end age. Uses binary search with cash flow sustainability checks.

**Returns:** optimal annual expense, optimal monthly expense, final wealth at death age, and convergence info.

---

## Input Schema

Both tools accept a `profile` object with the following fields:

### Required

| Field | Type | Description |
|---|---|---|
| `propertyAssets` | number | Current property value ($) |
| `savings` | number | Cash/investment savings ($) |
| `mortgageBalance` | number | Outstanding mortgage ($) |
| `superannuationBalance` | number | Super balance ($) |
| `salary` | number | Annual gross salary package incl. super ($) |
| `partnerSalary` | number | Partner annual gross salary incl. super ($) |
| `expenses` | number | Annual living expenses ($) |
| `currentAge` | number | Your current age |
| `retireAge` | number | Planned retirement age |
| `partnerAge` | number | Partner's current age |
| `partnerRetireAge` | number | Partner's retirement age |
| `relationshipStatus` | `"single"` \| `"couple"` | Relationship status |
| `isHomeowner` | boolean | Whether you own your home |

### Optional (with defaults)

| Field | Default | Description |
|---|---|---|
| `deathAge` | `90` | Plan end age |
| `mortgageRate` | `0.06` | Annual mortgage interest rate |
| `superannuationRate` | `0.07` | Annual super return rate |
| `savingsGrowthRate` | `0.025` | Annual savings/investment growth rate |
| `propertyGrowthRate` | `0.03` | Annual property growth rate |
| `propertyRentalYield` | `0.033` | Net rental yield |
| `cpiGrowthRate` | `0.03` | Annual inflation rate |
| `partnerSuperBalance` | — | Partner's super balance ($) |
| `lifeEvents` | — | Array of one-off income/expense events |
| `housePurchasePlan` | — | Future house purchase plan |

---

## Example prompt

Once connected, ask Claude:

> "Calculate a retirement plan for a 40-year-old couple in Australia. Combined salary $180k, savings $200k, super $350k, mortgage $400k on a $800k home, expenses $90k/year. They want to retire at 60."

> "What's the maximum I can spend each year if I'm 35, earning $120k, have $150k in super, $80k savings, no property, and want to retire at 65?"

---

## Requirements

- Node.js 18+
- No other setup needed — `npx` downloads and runs the package automatically

---

## License

MIT
