# Financial Planner

This is a full-stack financial planner web application.

## Project Structure
- `Frontend/` — Vue 3 + TypeScript (Vite)
- `Backend/` — ASP.NET Core Web API + C#

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- .NET 8 SDK
- SQL Server (local or cloud)

---

## Frontend Setup

1. Open a terminal in the `Frontend` folder.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Access the app at [http://localhost:5173](http://localhost:5173)

---

## Backend Setup

1. Open a terminal in the `Backend` folder.
2. Restore NuGet packages:
   ```sh
   dotnet restore
   ```
3. Update the SQL Server connection string in `appsettings.json` if needed.
4. Run EF Core migrations to create the database:
   ```sh
   dotnet ef database update
   ```
5. Start the backend server:
   ```sh
   dotnet run
   ```
6. API docs available at [https://localhost:5001/swagger](https://localhost:5001/swagger)

---

## Features
- User authentication (login/register)
- Input and visualization of assets, salary, and expenses
- Interactive net wealth chart
- Profile and settings management
- Responsive design

---

## Code Quality
- ESLint and Prettier for frontend
- Swagger for backend API documentation

---

## Deployment
- Build frontend: `npm run build`
- Publish backend: `dotnet publish -c Release`
- Deploy to your preferred cloud or hosting provider

---

## License
MIT
