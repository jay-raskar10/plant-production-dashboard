# Detailed UI <-> API Data Mapping

This document provides a 1-to-1 mapping of every data point visible on the current Dashboard UI to the required API JSON structure.

---

## 0. Metadata / Navigation Queries (Dropdowns)
**Location:** Sidebar / Navbar / Global Filters
**Endpoint:** `GET /api/meta`
*Ideally, this is fetched once on app load to populate the selectors.*

| UI Component | Data Label | Data Type | Required API JSON Path | Value Example | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Plant Selector** | Plant List | Array | `plants` | `[{"id": "pune", "name": "Pune"}]` | |
| **Line Selector** | Line List | Array | `lines` | `[{"id": "fcpv", "name": "FCPV", "plant_id": "pune"}]` | Filtered by selected Plant |
| **Station Selector**| Station List | Array | `stations_meta` | `[{"id": "op10", "name": "OP-10", "line_id": "fcpv"}]` | Filtered by selected Line |
| **Shift Selector** | Shift List | Array | `shifts` | `[{"id": "A", "name": "Shift A (06-14)"}]` | |

### ⬇️ REQUIRED JSON FRAGMENT (Metadata)
**Endpoint:** `GET /api/meta`

```json
{
  "plants": [
    { "id": "pune", "name": "Pune Plant" },
    { "id": "chennai", "name": "Chennai Plant" }
  ],
  "lines": [
    { "id": "fcpv", "name": "FCPV Line", "plant_id": "pune" },
    { "id": "lacv", "name": "LACV Line", "plant_id": "pune" },
    { "id": "compressor", "name": "Compressor Line", "plant_id": "chennai" }
  ],
  "stations_meta": [
    { "id": "op10", "name": "OP-10", "line_id": "fcpv" },
    { "id": "op20", "name": "OP-20", "line_id": "fcpv" },
    { "id": "op10_lacv", "name": "OP-10", "line_id": "lacv" }
  ],
  "shifts": [
    { "id": "A", "name": "Shift A (06:00-14:00)" },
    { "id": "B", "name": "Shift B (14:00-22:00)" },
    { "id": "C", "name": "Shift C (22:00-06:00)" }
  ]
}
```

---

## 1. Production Dashboard (Overview)
**File:** `src/components/dashboard/ProductionDashboard.jsx`

### A. Top KPI Ribbon
| UI Component | Data Label | Data Type | Required API JSON Path | Value Example |
| :--- | :--- | :--- | :--- | :--- |
| **Output Card** | Total Output | Integer | `line_kpi.production.current` | `1250` |
| | Target Output | Integer | `line_kpi.production.target` | `1400` |
| | Trend Indicator | Float | `line_kpi.production.trend` | `2.4` |
| **OEE Card** | Line OEE | Float (%) | `line_kpi.oee.value` | `85.5` |
| | OEE Trend | Float | `line_kpi.oee.trend` | `1.2` |
| **Rejection Card**| Rejections | Integer | `line_kpi.rejection.count` | `12` |
| **Eff. Card** | Shift Efficiency | Float (%) | `line_kpi.efficiency.value` | `92.0` |

### B. Production Velocity Chart & Downtime
| UI Component | Data Label | Data Type | Required API JSON Path | Value Example |
| :--- | :--- | :--- | :--- | :--- |
| **Line Chart** | Output Array | Array | `charts.velocity` | `[{"time": "10:00", "output": 160, "target": 150}]` |
| **Downtime** | Top Reasons | Array | `downtime.top_reasons` | `[{"reason": "Tool Change", "duration": 15}]` |

### C. Station Status Grid
| UI Component | Data Label | Data Type | Required API JSON Path | Value Example |
| :--- | :--- | :--- | :--- | :--- |
| **Station Card** | Station List | Array | `stations` | `[{"id": "op10", "status": "running"}]` |

### ⬇️ REQUIRED JSON FRAGMENT (Production)
**Endpoint:** `GET /api/line_status`

```json
{
  "line_kpi": {
    "production": { "current": 1250, "target": 1400, "trend": 2.4 },
    "oee": { "value": 85.5, "trend": 1.2 },
    "rejection": { "count": 12 },
    "efficiency": { "value": 92.0 }
  },
  "charts": {
    "velocity": [
      { "time": "06:00", "output": 120, "target": 150 },
      { "time": "07:00", "output": 132, "target": 150 }
    ]
  },
  "downtime": {
    "top_reasons": [
      { "reason": "Tool Change", "station": "OP-20", "duration": 15 },
      { "reason": "No Material", "station": "OP-10", "duration": 45 }
    ]
  },
  "stations": [
    { "id": "op10", "name": "OP-10", "operator": "Auto", "status": "running", "produced": 450, "cycle_time": 45.2, "efficiency": 88 },
    { "id": "op20", "name": "OP-20", "operator": "John", "status": "fault", "produced": 430, "cycle_time": 0, "efficiency": 75 }
  ]
}
```

---

## 2. SPC Dashboard (Process Quality)
**File:** `src/components/dashboard/SPCDashboard.jsx`

### A. Capability Metrics (Cp/Cpk/Pp/Ppk)
| UI Component | Data Label | Data Type | Required API JSON Path | Value Example |
| :--- | :--- | :--- | :--- | :--- |
| **Capability** | Cp, Cpk, Pp, Ppk | Object | `spc.metrics` | `{"cp": 1.67, "cpk": 1.52}` |

### B. Charts (Control, Histogram, Pie)
| UI Component | Data Label | Data Type | Required API JSON Path | Value Example |
| :--- | :--- | :--- | :--- | :--- |
| **Control Charts** | Points | Array | `spc.charts.control_points` | `[{"mean": 100.2, "range": 1.5}]` |
| **Histogram** | Distribution | Array | `spc.charts.histogram` | `[{"range": "98-100", "count": 25}]` |
| **Pie Chart** | Defects | Array | `spc.charts.defects` | `[{"name": "LVDT Fail", "value": 45}]` |

### ⬇️ REQUIRED JSON FRAGMENT (SPC)
**Endpoint:** `GET /api/line_status`

```json
{
  "spc": {
    "metrics": {
      "cp": { "value": 1.67, "status": "Excellent" },
      "cpk": { "value": 1.52 },
      "pp": { "value": 1.58 },
      "ppk": { "value": 1.28 }
    },
    "charts": {
      "control_points": [
         { "time": "14:30", "mean": 100.2, "range": 1.5, "ucl": 105, "lcl": 95, "cl": 100, "ucl_r": 3, "lcl_r": 0 }
      ],
      "histogram": [
        { "range": "94-96", "count": 5 },
        { "range": "96-98", "count": 12 },
        { "range": "98-100", "count": 40 },
        { "range": "100-102", "count": 30 },
        { "range": "102-104", "count": 10 }
      ],
      "defects": [
         { "name": "LVDT Fail", "value": 45 },
         { "name": "Camera Fail", "value": 30 }
      ]
    },
    "alerts": [
      { "message": "Rule 1 Violation", "time": "14:15", "station": "OP-20" }
    ]
  }
}
```

---

## 3. Station Analytics (Drill-down)
**File:** `src/pages/StationAnalytics.jsx`

### A. View Data
| UI Component | Data Label | Data Type | Required API JSON Path |
| :--- | :--- | :--- | :--- |
| **Graph View** | Trend | Array | `station_details.production_trend` |
| **Table View** | Logs | Array | `station_details.logs` |

### ⬇️ REQUIRED JSON FRAGMENT (Station Details)
**Endpoint:** `GET /api/station_status?id={station_id}`
*Note: This might be a separate call or part of the main payload if small enough.*

```json
{
  "station_details": {
    "production_trend": [
      { "time": "06:00", "output": 0 },
      { "time": "08:00", "output": 120 },
      { "time": "10:00", "output": 250 }
    ],
    "logs": [
      { "timestamp": "10:31:00", "part_id": "PN-101", "value": 10.45, "status": "OK", "cycle_time": 45.2 },
      { "timestamp": "10:32:00", "part_id": "PN-102", "value": 10.12, "status": "OK", "cycle_time": 44.8 }
    ]
  }
}
```
