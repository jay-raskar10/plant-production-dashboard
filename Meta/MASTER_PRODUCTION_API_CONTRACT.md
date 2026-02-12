# 🎯 MASTER PRODUCTION API CONTRACT - Plant Production Dashboard
**Version:** 1.0.0  
**Status:** ✅ PRODUCTION READY / ROCK SOLID
**Format:** DIRECT ROOT JSON (Optimized for LabVIEW Integration)

---

## 📋 TABLE OF CONTENTS
1. [General Specifications](#1-general-specifications)
2. [Authentication & Security](#2-authentication--security)
3. [Error Handling](#3-error-handling)
4. [Endpoint Payloads & Mapping](#4-endpoint-payloads--mapping)
   - [/api/line_status](#a-production-overview-api-line_status)
   - [/api/spc](#b-spc-analysis-api-spc)
   - [/api/station_details](#c-station-analytics-api-station_details)
5. [Query Parameter Encyclopedia](#5-query-parameter-encyclopedia)
6. [Data Type Standards](#6-data-type-standards)

---

## 1. GENERAL SPECIFICATIONS

### Data Format
- **Root Level**: Data is returned directly at the JSON root.
- **Naming**: `snake_case` (e.g., `line_kpi`, `produced_count`).
- **Timestamps**: ISO 8601 UTC (e.g., `2026-02-12T10:30:00.000Z`).

### Base URL
```
Production:  http://192.168.1.14:8001/api
```

---

## 2. AUTHENTICATION & SECURITY

### API Key (Current)
All requests must include the API key in the header:
```http
X-API-Key: your-secure-api-key
```

### JWT Bearer (Target)
For advanced security, the system supports Bearer tokens:
```http
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

---

## 3. ERROR HANDLING

Errors should return a standard status code and a descriptive message.

| Code | Meaning | Example Response |
| :--- | :--- | :--- |
| **400** | Bad Request | `{"error": "Invalid shift ID"}` |
| **401** | Unauthorized | `{"error": "API Key missing or invalid"}` |
| **404** | Not Found | `{"error": "Station OP-99 not found"}` |
| **500** | Server Error | `{"error": "LabVIEW Connection Timeout"}` |

---

## 4. ENDPOINT PAYLOADS & MAPPING

### A. PRODUCTION OVERVIEW (`/api/line_status`)
**Target Page**: Production Overview (Home)

| UI Element | Data Path | Example Value |
| :--- | :--- | :--- |
| **Output Card** | `line_kpi.production` | `{"current": 1200, "target": 1400}` |
| **OEE Card** | `line_kpi.oee` | `{"value": 85.5}` |
| **Velocity Chart**| `charts.velocity` | `[{"time": "10:00", "output": 120}]` |
| **Station Grid** | `stations` | `[{"id": "op10", "status": "running"}]` |

#### ✅ Payload Sample
```json
{
  "line_kpi": {
    "production": { "current": 1200, "target": 1400, "trend": 2.5 },
    "oee": { "value": 85.5 },
    "rejection": { "count": 15 },
    "efficiency": { "value": 92.2 }
  },
  "charts": {
    "velocity": [
      { "time": "06:00", "output": 110, "target": 120 },
      { "time": "07:00", "output": 125, "target": 120 },
      { "time": "08:00", "output": 115, "target": 120 },
      { "time": "09:00", "output": 130, "target": 120 },
      { "time": "10:00", "output": 140, "target": 120 }
    ]
  },
  "stations": [
    { "id": "op10", "status": "running", "cycle_time": 45.2, "produced": 450 },
    { "id": "op20", "status": "idle", "cycle_time": 0, "produced": 420 }
  ]
}
```

---

### B. SPC ANALYSIS (`/api/spc`)
**Target Page**: SPC Analysis & Station SPC Tab

| UI Element | Data Path | Example Value |
| :--- | :--- | :--- |
| **Metrics** | `spc.metrics` | `{"cp": 1.67, "cpk": 1.52}` |
| **Control Chart** | `spc.charts.control_points` | `[{"mean": 10.4, "ucl": 10.8}]` |
| **Histogram** | `spc.charts.histogram` | `[{"range": "10.0-10.2", "count": 25}]` |

#### ✅ Payload Sample
```json
{
  "spc": {
    "metrics": { "cp": { "value": 1.67 }, "cpk": { "value": 1.52 } },
    "charts": {
      "control_points": [
        { "time": "10:00", "mean": 10.4, "range": 0.2, "ucl": 10.8, "lcl": 10.0, "cl": 10.4 },
        { "time": "10:15", "mean": 10.5, "range": 0.3, "ucl": 10.8, "lcl": 10.0, "cl": 10.4 },
        { "time": "10:30", "mean": 10.3, "range": 0.1, "ucl": 10.8, "lcl": 10.0, "cl": 10.4 },
        { "time": "10:45", "mean": 10.6, "range": 0.4, "ucl": 10.8, "lcl": 10.0, "cl": 10.4 },
        { "time": "11:00", "mean": 10.4, "range": 0.2, "ucl": 10.8, "lcl": 10.0, "cl": 10.4 }
      ],
      "histogram": [
        { "range": "9.8-10.0", "count": 5 },
        { "range": "10.0-10.2", "count": 25 },
        { "range": "10.2-10.4", "count": 50 }
      ]
    }
  }
}
```

---

### C. STATION ANALYTICS (`/api/station_details`)
**Target Page**: Station Analytics (Trends & Logs)

| UI Element | Data Path | Example Value |
| :--- | :--- | :--- |
| **Trend Graph** | `production_trend` | `[{"time": "10:00", "output": 120}]` |
| **Table Logs** | `logs` | `[{"part_id": "SN123", "status": "OK"}]` |

#### ✅ Payload Sample
```json
{
  "production_trend": [
    { "time": "06:00", "output": 110, "target": 120 },
    { "time": "07:00", "output": 125, "target": 120 },
    { "time": "08:00", "output": 115, "target": 120 },
    { "time": "09:00", "output": 130, "target": 120 },
    { "time": "10:00", "output": 140, "target": 120 }
  ],
  "logs": [
    { "timestamp": "10:15:22", "part_id": "SN-001", "value": 10.42, "status": "OK", "cycle_time": 45.1 },
    { "timestamp": "10:16:10", "part_id": "SN-002", "value": 10.45, "status": "OK", "cycle_time": 44.8 },
    { "timestamp": "10:17:05", "part_id": "SN-003", "value": 9.98, "status": "NOT OK", "cycle_time": 45.5 },
    { "timestamp": "10:18:00", "part_id": "SN-004", "value": 10.40, "status": "OK", "cycle_time": 45.2 },
    { "timestamp": "10:18:45", "part_id": "SN-005", "value": 10.41, "status": "OK", "cycle_time": 44.9 }
  ]
}
```

---

## 5. QUERY PARAMETER ENCYCLOPEDIA

| Parameter | Type | Required | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `plant` | string | No | `pune`, `mumbai` | Plant location |
| `line` | string | No | `fcpv`, `lacv` | Production line ID |
| `station` | string | No | `op10`, `op20`, etc. | Select specific station |
| `shift` | string | No | `A`, `B`, `C` | Production shift |
| `dateRange` | string | No | `today`, `week` | Time filter |
| `parameter` | string | No | `opening-pressure` | Measurement key for SPC |

---

## 6. DATA TYPE STANDARDS

- **Output/Produced**: `Integer` (>= 0)
- **Efficiency/OEE**: `Float` (0.0 to 100.0)
- **Cycle Time**: `Float` (Seconds)
- **Status**: `Enum` ("running", "idle", "fault", "offline")
- **Part Status**: `Enum` ("OK", "NOT OK", "REWORK")
