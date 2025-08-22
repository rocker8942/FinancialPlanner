# Financial Planner Project Overview

## Project Purpose
This is a full-stack financial planner web application designed for Australian retirement planning with comprehensive Age Pension calculations, CPI-adjusted projections, and tax integration.

## Tech Stack
- **Frontend**: Vue 3 + TypeScript + Vite
- **Backend**: ASP.NET Core Web API + C# (.NET 8 SDK)  
- **Database**: Entity Framework Code-First with SQL Server
- **Styling**: Tailwind CSS v4
- **Charts**: ECharts for interactive visualizations
- **State Management**: Pinia store for authentication
- **Testing**: Vitest with Vue Test Utils, Playwright for E2E

## Architecture Overview
### Frontend Architecture
- **API Communication**: Axios with JWT token authentication
- **Routing**: Vue Router with authenticated routes  
- **Charts**: ECharts for interactive net wealth visualization
- **Local Storage**: Browser-based data storage for privacy

### Backend Architecture  
- **Authentication**: JWT tokens with `JwtService`
- **Financial Calculations**: `FinancialCalculationService` handles complex projections
- **Database**: Entity Framework with `AppDbContext`
- **API Documentation**: Swagger/OpenAPI available at `/swagger`

### Key Business Logic
- Separate growth rates for property (4% default) and financial assets (user-defined)
- Inflation adjustment calculations for real purchasing power
- Partner age and retirement considerations  
- Pension income calculations starting at specified ages
- Net financial asset = net-saving - mortgage + superannuation
- Auto-optimize expense: get optimal expense that makes net financial asset near 0 at project end
- Income provided by user is gross income including super and tax
- Disposable income = gross income - super - tax - mortgage interest (if mortgage exists)

## Key Files
- `Backend/Models/FinancialProfile.cs` - Core data model
- `Frontend/src/utils/calculations/financialPlanOrchestrator.ts` - Main financial calculation logic
- `Frontend/src/utils/calculations/expenseProcessor.ts` - Cash flow processing  
- `Frontend/src/utils/calculations/incomeCalculator.ts` - Income calculations including pension
- `Frontend/src/components/NetWealthChart.vue` - Chart visualization
- `Frontend/src/store/auth.ts` - Authentication state
- `Frontend/src/services/api.ts` - API layer

## Development Environment
- Windows environment with .NET 8 SDK and Node.js
- SQL Server for database (connection string in `appsettings.json`)
- ESLint and Prettier configured for frontend code quality
- Use PowerShell commands in terminal