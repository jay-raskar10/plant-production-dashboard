# 🎯 API CONTRACT - Plant Production Dashboard
**Version:** 1.0.0  
**Date:** February 9, 2026  
**Status:** Production Ready ✅  
**For:** Backend Developer + LabVIEW Integration

---

## 📋 TABLE OF CONTENTS

1. [General Specifications](#general-specifications)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Metadata](#1-metadata)
   - [Line Status](#2-line-status)
   - [Station Analytics](#3-station-analytics)
   - [SPC Data](#4-spc-data)
5. [Data Types](#data-types)
6. [Validation Rules](#validation-rules)
7. [Examples](#examples)

---

## 🌐 GENERAL SPECIFICATIONS

### Base URL
```
Production:  https://api.production.company.com/api/v1
Staging:     https://api.staging.company.com/api/v1
Development: http://localhost:5000/api/v1
```

### Content Type
```
Request:  Content-Type: application/json
Response: Content-Type: application/json; charset=utf-8
```

### Versioning
- All endpoints MUST include `/v1/` prefix
- Version is in URL path, not headers
- Breaking changes require new version (v2, v3, etc.)

### Naming Convention
- **JSON keys:** camelCase (`lineKpi`, `cycleTime`, `stationId`)
- **URL paths:** kebab-case (`/line-status`, `/station-analytics`)
- **Query params:** camelCase (`dateRange`, `stationId`)

### Response Wrapper
**ALL responses** use consistent wrapper:

```json
{
  "success": true,
  "data": { ...actual data... },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid-v4-here",
    "version": "1.0.0"
  }
}
```

### Timestamps
- **Format:** ISO 8601 with milliseconds UTC
- **Example:** `2024-01-01T12:30:45.123Z`
- **Timezone:** ALWAYS UTC (no local times)

### Pagination
For endpoints returning lists:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Query Parameters:**
- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 50, min: 1, max: 100)

### Rate Limiting
```
Rate Limit: 1000 requests per 15 minutes per API key
```

**Headers Returned:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1633024800
```

**Rate Limit Exceeded Response:**
```
HTTP 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

---

## 🔐 AUTHENTICATION

### Method: Bearer Token (JWT)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Acquisition
**Endpoint:** `POST /api/v1/auth/token`

**Request:**
```json
{
  "clientId": "labview_station_op10",
  "clientSecret": "your-secret-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "expiresAt": "2024-01-01T13:00:00.000Z",
    "tokenType": "Bearer"
  }
}
```

### Token Refresh
**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "token": "expired-or-expiring-token"
}
```

### Public Endpoints
Only `/health` endpoint is public (no auth required).

---

## ❌ ERROR HANDLING

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error, invalid parameters |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate ID, etc.) |
| 422 | Unprocessable Entity | Valid JSON but business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (never expose details) |
| 503 | Service Unavailable | Database down, maintenance mode |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "stationId",
      "value": "invalid_station",
      "allowed": ["OP10", "OP20", "OP30", "OP50", "OP60", "OP80"]
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid-v4-here",
    "version": "1.0.0"
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `AUTHENTICATION_REQUIRED` | 401 | No auth token provided |
| `INVALID_TOKEN` | 401 | Auth token is invalid/expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `DATABASE_ERROR` | 503 | Database connection failed |

---

## 📡 ENDPOINTS

### 1. METADATA

Get lists of plants, lines, stations, shifts for dropdowns.

**Endpoint:** `GET /api/v1/metadata`

**Authentication:** Required

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "plants": [
      {
        "id": "pune",
        "name": "Pune Manufacturing Plant",
        "active": true
      },
      {
        "id": "mumbai",
        "name": "Mumbai Assembly Plant",
        "active": true
      }
    ],
    "lines": [
      {
        "id": "fcpv",
        "name": "FCPV Assembly Line",
        "plant": "pune",
        "active": true
      },
      {
        "id": "assembly",
        "name": "Main Assembly Line",
        "plant": "pune",
        "active": true
      }
    ],
    "stations": [
      {
        "id": "OP10",
        "name": "Spring Assembly",
        "line": "fcpv",
        "sequence": 1
      },
      {
        "id": "OP20",
        "name": "Valve Insertion",
        "line": "fcpv",
        "sequence": 2
      },
      {
        "id": "OP30",
        "name": "Body Assembly",
        "line": "fcpv",
        "sequence": 3
      },
      {
        "id": "OP50",
        "name": "O-Ring Fitment",
        "line": "fcpv",
        "sequence": 4
      },
      {
        "id": "OP60",
        "name": "Nozzle Fitment",
        "line": "fcpv",
        "sequence": 5
      },
      {
        "id": "OP80",
        "name": "Leak Test",
        "line": "fcpv",
        "sequence": 6
      }
    ],
    "shifts": [
      {
        "id": "A",
        "name": "Morning Shift",
        "startTime": "06:00",
        "endTime": "14:00"
      },
      {
        "id": "B",
        "name": "Afternoon Shift",
        "startTime": "14:00",
        "endTime": "22:00"
      },
      {
        "id": "C",
        "name": "Night Shift",
        "startTime": "22:00",
        "endTime": "06:00"
      }
    ],
    "parameters": [
      {
        "id": "opening_pressure",
        "name": "Opening Pressure",
        "unit": "bar",
        "stations": ["OP10", "OP80"]
      },
      {
        "id": "leak_rate",
        "name": "Leak Rate",
        "unit": "ml/min",
        "stations": ["OP80"]
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

**Data Types:**
- All `id` fields: `string` (required, uppercase for stations)
- All `name` fields: `string` (required)
- `active`: `boolean` (required)
- `sequence`: `integer` (required, > 0)
- `startTime`/`endTime`: `string` (required, format: "HH:mm")

**Caching:**
- Cache this endpoint for 1 hour (rarely changes)
- Header: `Cache-Control: public, max-age=3600`

---

### 2. LINE STATUS

Get complete line status including production KPIs, charts, and station statuses.

**Endpoint:** `GET /api/v1/line-status`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Allowed Values | Description |
|-----------|------|----------|---------|----------------|-------------|
| `plant` | string | No | `"pune"` | `"pune"`, `"mumbai"`, `"delhi"` | Plant ID |
| `line` | string | No | `"fcpv"` | `"fcpv"`, `"assembly"` | Line ID |
| `station` | string | No | `"all"` | `"all"`, `"OP10"`, `"OP20"`, `"OP30"`, `"OP50"`, `"OP60"`, `"OP80"` | Filter by station |
| `shift` | string | No | `"all"` | `"all"`, `"A"`, `"B"`, `"C"` | Filter by shift |
| `dateRange` | string | No | `"today"` | `"today"`, `"week"`, `"month"`, or `"YYYY-MM-DD"` | Date range |

**Validation Rules:**
- `plant`: Must match existing plant ID (case-insensitive)
- `line`: Must belong to specified plant
- `station`: Must be "all" or valid station ID (uppercase)
- `shift`: Must be "all" or valid shift ID
- `dateRange`: 
  - Presets: "today", "week" (last 7 days), "month" (last 30 days)
  - Custom: `YYYY-MM-DD` format (max 90 days in past)

**Response:**
```json
{
  "success": true,
  "data": {
    "filters": {
      "plant": "pune",
      "line": "fcpv",
      "station": "all",
      "shift": "all",
      "dateRange": "today"
    },
    "lineKpi": {
      "production": {
        "current": 1200,
        "target": 1400,
        "trend": 2.5,
        "unit": "units"
      },
      "oee": {
        "value": 85.5,
        "availability": 92.0,
        "performance": 95.0,
        "quality": 98.0
      },
      "rejection": {
        "count": 15,
        "rate": 1.25,
        "topReason": "Pressure out of spec"
      },
      "efficiency": {
        "value": 92.2,
        "firstPassYield": 98.0
      }
    },
    "charts": {
      "velocity": [
        {
          "time": "2024-01-01T06:00:00.000Z",
          "output": 110,
          "target": 120
        },
        {
          "time": "2024-01-01T07:00:00.000Z",
          "output": 125,
          "target": 120
        },
        {
          "time": "2024-01-01T08:00:00.000Z",
          "output": 115,
          "target": 120
        }
      ]
    },
    "downtime": {
      "totalMinutes": 45,
      "topReasons": [
        {
          "reason": "Material shortage",
          "station": "OP10",
          "duration": 20,
          "unit": "minutes"
        },
        {
          "reason": "Tool change",
          "station": "OP30",
          "duration": 15,
          "unit": "minutes"
        }
      ]
    },
    "stations": [
      {
        "id": "OP10",
        "name": "Spring Assembly",
        "status": "running",
        "cycleTime": 45.2,
        "produced": 450,
        "rejected": 5,
        "operator": "John Doe",
        "lastUpdate": "2024-01-01T12:00:00.000Z"
      },
      {
        "id": "OP20",
        "name": "Valve Insertion",
        "status": "idle",
        "cycleTime": 0,
        "produced": 420,
        "rejected": 2,
        "operator": null,
        "lastUpdate": "2024-01-01T11:55:00.000Z"
      },
      {
        "id": "OP30",
        "name": "Body Assembly",
        "status": "fault",
        "cycleTime": 42.1,
        "produced": 410,
        "rejected": 8,
        "operator": "Jane Smith",
        "lastUpdate": "2024-01-01T12:00:00.000Z",
        "faultCode": "E001",
        "faultDescription": "Sensor malfunction"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

**Data Types:**

*lineKpi:*
- `production.current`: `integer` (required, >= 0)
- `production.target`: `integer` (required, >= 0)
- `production.trend`: `float` (optional, -100 to +100)
- `oee.value`: `float` (required, 0 to 100)
- `rejection.count`: `integer` (required, >= 0)
- `rejection.rate`: `float` (required, >= 0)
- `efficiency.value`: `float` (required, 0 to 100)

*stations:*
- `status`: `enum` (required) - `"running"`, `"idle"`, `"fault"`, `"offline"`
- `cycleTime`: `float` (required, >= 0) - seconds
- `produced`: `integer` (required, >= 0)
- `rejected`: `integer` (required, >= 0)
- `operator`: `string|null` (optional)
- `faultCode`: `string` (optional, only when status="fault")

**Caching:**
- No caching (real-time data)
- Header: `Cache-Control: no-cache, no-store, must-revalidate`

---

### 3. STATION ANALYTICS

Get detailed analytics for a specific station (combines production trends, logs, and SPC data).

**Endpoint:** `GET /api/v1/stations/{stationId}/analytics`

**Authentication:** Required

**Path Parameters:**
- `stationId`: Station ID (required, uppercase, e.g., "OP10")

**Query Parameters:**

| Parameter | Type | Required | Default | Allowed Values | Description |
|-----------|------|----------|---------|----------------|-------------|
| `dateRange` | string | No | `"today"` | `"today"`, `"week"`, `"month"`, `"YYYY-MM-DD"` | Date range |
| `shift` | string | No | `"all"` | `"all"`, `"A"`, `"B"`, `"C"` | Filter by shift |
| `parameter` | string | No | null | See metadata | SPC parameter (e.g., "opening_pressure") |
| `page` | integer | No | 1 | >= 1 | Page number for logs |
| `limit` | integer | No | 50 | 1-100 | Items per page for logs |

**Response:**
```json
{
  "success": true,
  "data": {
    "station": {
      "id": "OP10",
      "name": "Spring Assembly",
      "line": "fcpv",
      "status": "running"
    },
    "productionTrend": [
      {
        "time": "2024-01-01T06:00:00.000Z",
        "output": 110,
        "target": 120,
        "rejected": 2
      },
      {
        "time": "2024-01-01T07:00:00.000Z",
        "output": 125,
        "target": 120,
        "rejected": 1
      }
    ],
    "logs": {
      "items": [
        {
          "id": "log-001",
          "timestamp": "2024-01-01T10:15:22.000Z",
          "partId": "SN-001",
          "parameter": "opening_pressure",
          "value": 10.42,
          "unit": "bar",
          "lsl": 10.0,
          "usl": 11.0,
          "status": "OK",
          "cycleTime": 45.1,
          "operator": "John Doe"
        },
        {
          "id": "log-002",
          "timestamp": "2024-01-01T10:16:10.000Z",
          "partId": "SN-002",
          "parameter": "opening_pressure",
          "value": 10.45,
          "unit": "bar",
          "lsl": 10.0,
          "usl": 11.0,
          "status": "OK",
          "cycleTime": 44.8,
          "operator": "John Doe"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 1250,
        "totalPages": 25,
        "hasNext": true,
        "hasPrev": false
      }
    },
    "spc": {
      "parameter": "opening_pressure",
      "metrics": {
        "cp": 1.67,
        "cpk": 1.52,
        "pp": 1.58,
        "ppk": 1.45,
        "mean": 10.42,
        "stdDev": 0.15,
        "lsl": 10.0,
        "usl": 11.0,
        "target": 10.5
      },
      "controlChart": [
        {
          "time": "2024-01-01T10:00:00.000Z",
          "mean": 10.4,
          "range": 0.2,
          "ucl": 10.8,
          "lcl": 10.0,
          "cl": 10.4,
          "violation": null
        },
        {
          "time": "2024-01-01T10:15:00.000Z",
          "mean": 10.5,
          "range": 0.3,
          "ucl": 10.8,
          "lcl": 10.0,
          "cl": 10.4,
          "violation": "trend"
        }
      ],
      "histogram": [
        {
          "binStart": 9.8,
          "binEnd": 10.0,
          "count": 5,
          "percentage": 4.0
        },
        {
          "binStart": 10.0,
          "binEnd": 10.2,
          "count": 25,
          "percentage": 20.0
        },
        {
          "binStart": 10.2,
          "binEnd": 10.4,
          "count": 50,
          "percentage": 40.0
        }
      ],
      "alerts": [
        {
          "type": "TREND",
          "severity": "warning",
          "message": "7 consecutive points trending upward",
          "timestamp": "2024-01-01T11:00:00.000Z"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

**Data Types:**

*logs.items:*
- `status`: `enum` (required) - `"OK"`, `"NOT OK"`, `"REWORK"`
- `value`: `float` (required)
- `lsl`/`usl`: `float` (optional) - Lower/Upper Spec Limits
- `cycleTime`: `float` (required, >= 0)

*spc.controlChart:*
- `violation`: `enum|null` (optional) - `null`, `"trend"`, `"run"`, `"outlier"`, `"shift"`

*spc.alerts:*
- `severity`: `enum` (required) - `"info"`, `"warning"`, `"critical"`
- `type`: `enum` (required) - `"TREND"`, `"RUN"`, `"OUTLIER"`, `"SHIFT"`, `"CPK_LOW"`

**Validation:**
- `stationId`: Must exist in metadata
- `parameter`: Must be valid for this station (check metadata)
- `dateRange`: Maximum 90 days in past

**Caching:**
- Cache for 30 seconds (semi-real-time)
- Header: `Cache-Control: public, max-age=30`

---

### 4. SPC DATA

Get SPC (Statistical Process Control) data for a line or station.

**Endpoint:** `GET /api/v1/spc`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Allowed Values | Description |
|-----------|------|----------|---------|----------------|-------------|
| `line` | string | Yes | - | `"fcpv"`, `"assembly"` | Line ID |
| `station` | string | No | `"all"` | `"all"`, `"OP10"`, ... | Filter by station |
| `parameter` | string | Yes | - | See metadata | Measurement parameter |
| `dateRange` | string | No | `"today"` | `"today"`, `"week"`, `"month"` | Date range |

**Response:**
```json
{
  "success": true,
  "data": {
    "parameter": "opening_pressure",
    "unit": "bar",
    "specifications": {
      "lsl": 10.0,
      "usl": 11.0,
      "target": 10.5
    },
    "metrics": {
      "cp": 1.67,
      "cpk": 1.52,
      "pp": 1.58,
      "ppk": 1.45,
      "mean": 10.42,
      "stdDev": 0.15,
      "sampleSize": 125
    },
    "controlChart": [
      {
        "time": "2024-01-01T10:00:00.000Z",
        "mean": 10.4,
        "range": 0.2,
        "ucl": 10.8,
        "lcl": 10.0,
        "cl": 10.4,
        "violation": null
      }
    ],
    "histogram": [
      {
        "binStart": 9.8,
        "binEnd": 10.0,
        "count": 5,
        "percentage": 4.0
      }
    ],
    "alerts": []
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

**Validation:**
- `parameter`: Must exist for specified line/station
- `line` + `station` combination must be valid

---

## 📊 DATA TYPES

### Enums

**Station Status:**
```typescript
type StationStatus = "running" | "idle" | "fault" | "offline";
```

**Part Status:**
```typescript
type PartStatus = "OK" | "NOT OK" | "REWORK";
```

**SPC Violations:**
```typescript
type SpcViolation = "trend" | "run" | "outlier" | "shift" | null;
```

**Alert Severity:**
```typescript
type AlertSeverity = "info" | "warning" | "critical";
```

**Alert Types:**
```typescript
type AlertType = "TREND" | "RUN" | "OUTLIER" | "SHIFT" | "CPK_LOW" | "PROCESS_UNSTABLE";
```

### Common Structures

**Pagination:**
```typescript
interface Pagination {
  page: number;          // Current page (1-indexed)
  limit: number;         // Items per page
  total: number;         // Total items across all pages
  totalPages: number;    // Total number of pages
  hasNext: boolean;      // Are there more pages?
  hasPrev: boolean;      // Is there a previous page?
}
```

**Meta:**
```typescript
interface Meta {
  timestamp: string;     // ISO 8601 UTC
  requestId: string;     // UUID v4
  version: string;       // API version
}
```

---

## ✅ VALIDATION RULES

### Query Parameters

**plant:**
- Type: `string`
- Pattern: `/^[a-z]+$/` (lowercase letters only)
- Min length: 2
- Max length: 20
- Example: `"pune"`, `"mumbai"`

**line:**
- Type: `string`
- Pattern: `/^[a-z_]+$/` (lowercase letters and underscores)
- Min length: 2
- Max length: 30
- Example: `"fcpv"`, `"assembly"`

**station:**
- Type: `string`
- Pattern: `/^(all|OP\d{2})$/` (either "all" or "OP" + 2 digits)
- Examples: `"all"`, `"OP10"`, `"OP80"`

**shift:**
- Type: `string`
- Pattern: `/^(all|[ABC])$/`
- Examples: `"all"`, `"A"`, `"B"`, `"C"`

**dateRange:**
- Type: `string`
- Presets: `"today"`, `"week"`, `"month"`
- Custom: `/^\d{4}-\d{2}-\d{2}$/` (YYYY-MM-DD)
- Validation: Date must be <= today and >= 90 days ago

**page:**
- Type: `integer`
- Min: 1
- Max: 10000 (reasonable limit)

**limit:**
- Type: `integer`
- Min: 1
- Max: 100
- Default: 50

### Response Validation

All numeric values:
- Must not be `NaN`, `Infinity`, or `-Infinity`
- Use `null` for missing values, not `0` or `""`

All timestamps:
- Must be valid ISO 8601 format
- Must include timezone (Z for UTC)
- Must include milliseconds

All arrays:
- Empty array `[]` is valid
- Never return `null` instead of empty array

---

## 📝 EXAMPLES

### Example 1: Get Line Status for Today

**Request:**
```bash
GET /api/v1/line-status?plant=pune&line=fcpv&dateRange=today
Authorization: Bearer {token}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "filters": { ... },
    "lineKpi": { ... },
    "charts": { ... },
    "stations": [ ... ]
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "abc-123",
    "version": "1.0.0"
  }
}
```

---

### Example 2: Get Station Analytics with Pagination

**Request:**
```bash
GET /api/v1/stations/OP10/analytics?parameter=opening_pressure&page=2&limit=20
Authorization: Bearer {token}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "station": { ... },
    "productionTrend": [ ... ],
    "logs": {
      "items": [ ... ],
      "pagination": {
        "page": 2,
        "limit": 20,
        "total": 1250,
        "totalPages": 63,
        "hasNext": true,
        "hasPrev": true
      }
    },
    "spc": { ... }
  },
  "meta": { ... }
}
```

---

### Example 3: Validation Error

**Request:**
```bash
GET /api/v1/line-status?plant=invalid_plant&station=OP99
Authorization: Bearer {token}
```

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "plant",
        "value": "invalid_plant",
        "message": "Plant not found",
        "allowed": ["pune", "mumbai", "delhi"]
      },
      {
        "field": "station",
        "value": "OP99",
        "message": "Station not found",
        "allowed": ["all", "OP10", "OP20", "OP30", "OP50", "OP60", "OP80"]
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "xyz-789",
    "version": "1.0.0"
  }
}
```

---

### Example 4: Authentication Error

**Request:**
```bash
GET /api/v1/metadata
Authorization: Bearer invalid_token
```

**Response: 401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid or expired"
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "def-456",
    "version": "1.0.0"
  }
}
```

---

### Example 5: Server Error

**Request:**
```bash
GET /api/v1/line-status?plant=pune
Authorization: Bearer {token}
```

**Response: 503 Service Unavailable**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Service temporarily unavailable. Please try again later."
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "ghi-012",
    "version": "1.0.0"
  }
}
```

**Note:** Never expose internal error details like SQL queries, stack traces, or database connection strings.

---

## 🚀 IMPLEMENTATION CHECKLIST

### For Backend Developer:

- [ ] All endpoints use `/api/v1/` prefix
- [ ] All responses use consistent wrapper format
- [ ] All timestamps in ISO 8601 UTC format
- [ ] All query parameters validated against rules
- [ ] All enums match specifications exactly
- [ ] Authentication required on all endpoints except `/health`
- [ ] Rate limiting implemented (1000 req/15 min)
- [ ] Error codes match specification
- [ ] HTTP status codes match specification
- [ ] Pagination implemented for logs
- [ ] All arrays return `[]` when empty, never `null`
- [ ] All numeric values validated (no NaN/Infinity)
- [ ] SQL injection protection (parameterized queries)
- [ ] CORS configured properly
- [ ] HTTPS enforced in production
- [ ] Request logging implemented
- [ ] Error logging implemented (server-side only)
- [ ] Health check endpoint working
- [ ] API documentation (Swagger) generated
- [ ] Unit tests written for all endpoints
- [ ] Integration tests written
- [ ] Load testing completed

### For Frontend Developer:

- [ ] Update all API calls to use `/api/v1/` prefix
- [ ] Handle `success: false` responses
- [ ] Display error messages from `error.message`
- [ ] Implement retry logic for 503 errors
- [ ] Respect rate limit headers
- [ ] Send auth token in all requests
- [ ] Implement token refresh logic
- [ ] Handle 401/403 errors (redirect to login)
- [ ] Implement pagination for logs
- [ ] Parse ISO 8601 timestamps correctly
- [ ] Handle null values in optional fields
- [ ] Validate enum values match specs
- [ ] Display loading states during API calls
- [ ] Handle network errors gracefully

### For LabVIEW Integration:

- [ ] Implement authentication (token acquisition)
- [ ] Implement token refresh before expiry
- [ ] Validate all data before sending
- [ ] Handle rate limiting (implement backoff)
- [ ] Use HTTPS in production
- [ ] Log all API requests/responses
- [ ] Implement retry logic for failures
- [ ] Handle 503 errors (service unavailable)
- [ ] Buffer data if API is down
- [ ] Monitor API response times

---

## 📞 SUPPORT

**Questions about this API contract?**
- Create a GitHub issue
- Contact: api-team@company.com
- Slack: #api-support

**Found a bug?**
- Report on GitHub Issues
- Include `requestId` from error response

**Need a new endpoint?**
- Submit API change request
- Breaking changes require v2

---

**Last Updated:** February 9, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready