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
- **URL parameter support** for sharing specific financial scenarios

---

## URL Parameters

The retirement planner supports URL parameters to pre-populate financial data and share specific scenarios. When accessing `/retirementplanner` with query parameters, the form will automatically load with the provided values and display calculated results immediately.

### Supported Parameters

| Parameter | Description | Example Value | Maps To |
|-----------|-------------|---------------|---------|
| `currentAge` | Your current age | `40` | Current Age |
| `retirementAge` or `retireAge` | Target retirement age | `60` | Retirement Age |
| `super` | Superannuation balance | `500000` | Superannuation Balance |
| `income` | Annual salary/income | `80000` | Salary |
| `expense` | Annual expenses | `50000` | Expenses |
| `investmentProperty` | Investment property value | `600000` | Property Assets |
| `partnerAge` | Partner's current age | `38` | Partner Age |
| `partnerRetirementAge` or `partnerRetireAge` | Partner's retirement age | `58` | Partner Retirement Age |
| `savings` | Cash savings/investments | `100000` | Savings |
| `mortgage` | Outstanding mortgage balance | `300000` | Mortgage Balance |
| `partnerSalary` | Partner's annual salary | `60000` | Partner Salary |

### Usage Examples

#### Basic Scenario
```
/retirementplanner?currentAge=40&retireAge=60&super=500000
```

#### Comprehensive Single Person
```
/retirementplanner?currentAge=35&retireAge=65&super=300000&income=75000&expense=45000&investmentProperty=800000&savings=50000&mortgage=250000
```

#### Couple Scenario
```
/retirementplanner?currentAge=40&retireAge=60&partnerAge=38&partnerRetireAge=58&super=400000&income=80000&partnerSalary=60000&expense=70000
```

#### Quick Test Scenario
```
/retirementplanner?currentAge=30&income=65000&expense=40000&super=150000
```

### How It Works

1. **Priority Order**: URL parameters override saved data with the highest priority:
   - **URL Parameters** (highest) → LocalStorage → API → Defaults (lowest)

2. **Auto-Calculate**: Results and charts update automatically when the page loads with parameters

3. **Smart Relationship Detection**: Automatically sets relationship status to "couple" when any partner parameter (`partnerAge`, `partnerRetirementAge`, `partnerRetireAge`, or `partnerSalary`) is provided

4. **Persistence**: Modified values are saved to localStorage for future visits

5. **Validation**: Invalid parameter values fall back to defaults

6. **Flexibility**: You can provide any combination of parameters - missing ones use saved/default values

### Sharing Scenarios

URL parameters make it easy to share specific financial planning scenarios:

- **Financial advisors** can send clients pre-configured links
- **Researchers** can share standardized scenarios for analysis  
- **Users** can bookmark different "what-if" scenarios
- **Demos** can showcase the tool with realistic sample data

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
