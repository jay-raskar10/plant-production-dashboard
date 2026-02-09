# Plant Production Dashboard - Backend API

Backend API server for the Manufacturing Dashboard application using Express.js and SQL Server.

## Features

- RESTful API endpoints for Production and SPC dashboards
- SQL Server database connection with connection pooling
- Statistical Process Control (SPC) calculations
- Real-time production metrics
- Station-level analytics

## Prerequisites

- Node.js (v16 or higher)
- SQL Server database (running locally or remotely)
- Access to MES_Production database

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_SERVER=localhost
DB_NAME=MES_Production
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=1433

NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check server and database health

### Production API (`/api/production`)

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/kpis` | GET | Get production KPIs | `station`, `date`, `shift` |
| `/station-comparison` | GET | Compare all stations | - |
| `/hourly-rate` | GET | Hourly production rate | `station`, `date` |
| `/top-defects` | GET | Pareto defect analysis | `station`, `date`, `limit` |
| `/shift-performance` | GET | Shift comparison | `startDate`, `endDate` |
| `/rework-analysis` | GET | Rework iteration analysis | `station`, `date` |

### SPC API (`/api/spc`)

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/control-chart` | GET | SPC control chart data | `station`, `parameter`, `startTime`, `endTime` |
| `/capability` | GET | Process capability (Cpk, Cp) | `station`, `parameter`, `date` |
| `/distribution` | GET | Histogram distribution | `station`, `parameter`, `date`, `bins` |
| `/multi-station-overview` | GET | All stations Cpk overview | - |

### Example Requests

**Get Production KPIs:**
```bash
curl http://localhost:5000/api/production/kpis?station=OP10
```

**Get SPC Control Chart:**
```bash
curl "http://localhost:5000/api/spc/control-chart?station=OP10&parameter=LVDT"
```

**Get Station Comparison:**
```bash
curl http://localhost:5000/api/production/station-comparison
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-27T14:30:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Additional info (dev mode only)"
  },
  "timestamp": "2024-01-27T14:30:00.000Z"
}
```

## Database Schema

The API expects the following SQL Server tables:

- **Transaction Tables**: OP10, OP20, OP30, OP50, OP60, OP80
- **Counter Tables**: OP10_CNTR, OP20_CNTR, OP30_CNTR, OP50_CNTR, OP60_CNTR, OP80_CNTR
- **Configuration**: Recipe_Master, Tolerance_Setting
- **Historical**: Shift_Counter_Log

See `../Meta/Database_Dashboard_Analysis.md` for complete schema documentation.

## Project Structure

```
server/
├── server.js              # Main server entry point
├── db/
│   └── connection.js      # SQL Server connection pool
├── routes/
│   ├── production.routes.js   # Production endpoints
│   └── spc.routes.js         # SPC endpoints
├── services/
│   └── calculationService.js # Statistical calculations
├── middleware/
│   ├── errorHandler.js    # Error handling
│   └── validation.js      # Request validation
├── utils/
│   └── constants.js       # Application constants
└── package.json
```

## Technologies

- **Express.js** - Web framework
- **mssql** - SQL Server client
- **cors** - CORS middleware
- **dotenv** - Environment configuration
- **express-validator** - Request validation

## Development

The server uses `nodemon` for auto-reloading during development. Any changes to `.js` files will automatically restart the server.

## Troubleshooting

### Database Connection Issues

If you see `DB_CONNECTION_ERROR`:

1. Verify SQL Server is running
2. Check firewall allows port 1433
3. Verify credentials in `.env`
4. Ensure database name is correct
5. Check SQL Server authentication mode (Windows vs SQL Auth)

### Query Errors

If specific queries fail:

1. Verify table names match your database
2. Check column names in constants.js
3. Ensure Recipe_Master table has data for control limits

## License

MIT
