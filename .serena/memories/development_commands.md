# Development Commands

## Frontend Commands (Vue 3 + TypeScript)
- **Development server**: `cd Frontend && npm run dev` (serves on http://localhost:5173)
- **Build**: `cd Frontend && npm run build`
- **Tests**: `cd Frontend && npm test` (Vitest with jsdom)
- **Test coverage**: `cd Frontend && npm run test:coverage`
- **Single test run**: `cd Frontend && npm run test:run`
- **E2E Tests**: `cd Frontend && npm run test:e2e` (Playwright)

## Backend Commands (ASP.NET Core + C#)
- **Development server**: `cd Backend && dotnet run` (serves on https://localhost:5001)
- **Restore packages**: `cd Backend && dotnet restore`
- **Database migration**: `cd Backend && dotnet ef database update`
- **Create new migration**: `cd Backend && dotnet ef migrations add <MigrationName>`
- **Build**: `cd Backend && dotnet build`
- **Production build**: `cd Backend && dotnet publish -c Release`

## Testing and Quality
- **Frontend lint**: `cd Frontend && npm run lint`
- **Run relevant tests after code changes**: Use `npm test` for unit tests
- **Build verification**: Use `npm run build` to check build integrity

## Git Commands (Windows Environment)
- Use standard git commands with PowerShell
- Available: `git status`, `git add .`, `git commit`, `git push`, etc.

## File Operations (Windows)
- **List files**: Use `dir` or PowerShell `ls` equivalent
- **Find files**: Use PowerShell `Get-ChildItem` or file search tools
- **Text search**: Use `findstr` or PowerShell `Select-String`