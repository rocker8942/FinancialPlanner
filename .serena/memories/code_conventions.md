# Code Conventions and Best Practices

## General Principles
- **Keep it simple**: Follow KISS principle as much as possible
- **Small components**: Keep file, class, method size small using coding best practices
- **Readability over elegance**: Prioritize clear, readable code over elegant but complex solutions
- **Test after changes**: Run relevant tests whenever code is changed

## Frontend (Vue 3 + TypeScript)
- **File Structure**: Modular approach with separate calculation utilities
- **Type Safety**: Strong TypeScript typing throughout
- **Component Organization**: 
  - Input components organized in logical groups (Personal Profile, Assets, Income/Expenses, Advanced Options)
  - Separate calculation logic from UI components
- **State Management**: Use Pinia for global state (auth, etc.)
- **Error Handling**: Proper error boundaries and user feedback

## Backend (ASP.NET Core + C#)
- **Entity Framework**: Code-First approach with proper migrations
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Authentication**: JWT token-based with secure handling
- **Validation**: Input validation at API boundaries

## Financial Calculations
- **Modular Design**: Separate calculators for different aspects (income, expenses, assets, etc.)
- **Year-by-year Processing**: Process each year from current age to death age
- **First Year Logic**: Special handling to avoid double-counting initial values
- **CPI Adjustments**: Automatic inflation adjustments for realistic projections
- **Australian Tax Integration**: Current 2025-26 tax brackets and thresholds

## Naming Conventions
- **TypeScript/JavaScript**: camelCase for variables and functions, PascalCase for classes
- **C#**: PascalCase for public members, camelCase for private
- **Files**: PascalCase for components, camelCase for utilities
- **Clear Descriptive Names**: Function and variable names should clearly indicate purpose

## Testing Strategy
- **Unit Tests**: Vitest for frontend calculation logic
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user workflows
- **Test Coverage**: Maintain good coverage especially for financial calculations