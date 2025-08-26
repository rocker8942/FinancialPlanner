# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## best practice to follow
- keep it simple as much as possible
- keep the file, class, method size as small as possible using the coding best practices
- readability over eligance code
- run relevant test whenever changed code

## domain knowledge

- This app is financial planner web application.
- Get an input of asset, salary, and expenses.
- Calculate the financial plan based on the input.
- Provide a summary of the financial plan.
- Use the latest financial planning algorithms and best practices.
- Ensure the financial plan is realistic and achievable.

## Development Commands

### Frontend (Vue 3 + TypeScript)
- **Development server**: `cd Frontend && npm run dev` (serves on http://localhost:5173)
- **Build**: `cd Frontend && npm run build`
- **Tests**: `cd Frontend && npm test` (Vitest with jsdom)
- **Test coverage**: `cd Frontend && npm run test:coverage`
- **Single test run**: `cd Frontend && npm run test:run`

### Backend (ASP.NET Core + C#)
- **Development server**: `cd Backend && dotnet run` (serves on https://localhost:5001)
- **Restore packages**: `cd Backend && dotnet restore`
- **Database migration**: `cd Backend && dotnet ef database update`
- **Create new migration**: `cd Backend && dotnet ef migrations add <MigrationName>`
- **Build**: `cd Backend && dotnet build`
- **Production build**: `cd Backend && dotnet publish -c Release`

## Architecture Overview

### Database Schema
- Uses Entity Framework Code-First with SQL Server
- Key entities: `User`, `FinancialProfile`
- Financial profiles track separate property and financial assets with different growth rates
- Supports user and partner scenarios with separate pension calculations

### Frontend Architecture
- **State Management**: Pinia store for authentication (`useAuthStore`)
- **Routing**: Vue Router with authenticated routes
- **Styling**: Tailwind CSS v4
- **Charts**: ECharts for interactive net wealth visualization
- **API Communication**: Axios with JWT token authentication
- **Testing**: Vitest with Vue Test Utils

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
- Net financial asset = net-saving - morgate + superannuation. 
- Auto-optimize expense: get the optimal exepese that make the net financial asset to be near 0 at the project ends. 
- Income provided by user is growth income including super and tax. 
- Disposible income = growth income - super contribution - tax - mortgage interest (if there is a mortgage)

### Data Flow
1. User inputs financial data via `AssetInputForm.vue`
2. Data stored browser local storage
3. `calculateFinancialPlanModular` processes projections
4. Results displayed in `NetWealthChart.vue` using ECharts
5. Year-by-year wealth projections with inflation adjustments

### Key Files to Understand
- `Backend/Models/FinancialProfile.cs` - Core data model
- `Frontend/src/utils/calculations/financialPlanOrchestrator.ts` - Financial algorithms
- `Frontend/src/components/NetWealthChart.vue` - Chart visualization
- `Frontend/src/store/auth.ts` - Authentication state
- `Frontend/src/services/api.ts` - API layer

## Development Environment
- Windows environment with .NET 8 SDK and Node.js
- SQL Server for database (connection string in `appsettings.json`)
- ESLint and Prettier configured for frontend code quality
- Use powershell command in terminal

## Frontend UI
- input boxes should be in groups of Personal Profile, Assets, Income and expenses, Advanced Options
- Advanced Options includes 
    . Age the plan ends
    . Property Growth Rate
    . Expected Savings Growth Rate
    . Mortgage Interest Rate
    . Superannuation Return Rate
    . Inflation Rate

## Prompt Guide
- Use context7 mcp    

