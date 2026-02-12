# Detailed UI <-> API Data Mapping (Production Ready)

This document provides a rock-solid contract between the UI and the LabVIEW API. All endpoints return data directly at the JSON root (no `success` or `data` wrappers).

---

## 0. Metadata / Navigation Queries
**Endpoint:** `GET /api/meta` (Internal Fallback Active)
*Note: Currently using hardcoded fallback in `FilterContext.jsx` as the live endpoint is in queue.*

| UI Component | Data Label | Data Type | JSON Path |
| :--- | :--- | :--- | :--- |
| **Plants** | Plant List | Array | `plants` |
| **Lines** | Line List | Array | `lines` |
| **Stations** | Station List | Array | `stations_meta` |

---

## 1. Production Overview
**Endpoint:** `GET /api/line_status`

| UI Component | Data Label | Data Type | JSON Path |
| :--- | :--- | :--- | :--- |
| **Output Card** | Total/Target | Object | `line_kpi.production` |
| **OEE/Eff** | Metrics | Object | `line_kpi.oee`, `line_kpi.efficiency` |
| **Velocity Chart**| Time-series | Array | `charts.velocity` |
| **Stations Grid** | Status/CT | Array | `stations` |

### ✅ RESPONSE STRUCTURE
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
    { "id": "op20", "status": "idle", "cycle_time": 0, "produced": 420 },
    { "id": "op30", "status": "fault", "cycle_time": 42.1, "produced": 410 }
  ]
}
```

---

## 2. SPC Analysis
**Endpoint:** `GET /api/spc`

| UI Component | Data Label | Data Type | JSON Path |
| :--- | :--- | :--- | :--- |
| **Metrics** | Cp, Cpk, etc. | Object | `spc.metrics` |
| **Control Charts** | Mean/Range | Array | `spc.charts.control_points` |
| **Histogram** | Probability | Array | `spc.charts.histogram` |

### ✅ RESPONSE STRUCTURE
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
        { "range": "10.2-10.4", "count": 50 },
        { "range": "10.4-10.6", "count": 35 },
        { "range": "10.6-10.8", "count": 10 }
      ]
    },
    "alerts": []
  }
}
```

---

## 3. Station Analytics (Drill-down)
**Endpoints:** `GET /api/station_details` + `GET /api/spc`
*Note: This page uses dual-fetch to provide full visibility.*

| UI Tab | Feature | Source | JSON Path |
| :--- | :--- | :--- | :--- |
| **Graph** | Prod. Trend | `station_details` | `production_trend` |
| **Table** | Audit Logs | `station_details` | `logs` |
| **SPC** | Control Charts| `spc` (filtered) | `spc.charts.control_points` |

### ✅ RESPONSE STRUCTURE (`station_details`)
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

## 4. API Call Examples (Query Filters)

The frontend sends the following query parameters to filter data. The backend should handle these to return the correct subset of data.

| Feature | Filter Pattern | Example URL |
| :--- | :--- | :--- |
| **Line Overview**| `plant`, `line`, `dateRange` | `/api/line_status?plant=pune&line=fcpv&dateRange=today` |
| **SPC Analytics**| `viewMode`, `parameter` | `/api/spc?line=fcpv&viewMode=spc&parameter=opening-pressure` |
| **Station Drill-down**| `id` (Station ID) | `/api/station_details?id=op10&shift=A` |
| **Filtered SPC** | `station` | `/api/spc?station=op10&parameter=leak-rate` |
