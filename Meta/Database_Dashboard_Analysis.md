# Manufacturing Database - Complete Dashboard & Visualization Guide

## 📋 Table of Contents
1. [Database Overview](#database-overview)
2. [Table-by-Table Analysis](#table-by-table-analysis)
3. [SPC Dashboard Design](#spc-dashboard-design)
4. [Production Dashboard Design](#production-dashboard-design)
5. [Advanced Analytics](#advanced-analytics)

---

## Database Overview

### System Architecture
This is a **Manufacturing Execution System (MES)** database tracking a multi-station assembly/testing line for automotive or industrial components (likely hydraulic/pneumatic assemblies based on leak tests, spring loads, and torque measurements).

### Process Flow
```
OP10 → OP20 → OP30 → OP50 → OP60 → OP80
(Initial → Assembly → Testing → Final Assembly → Torque → Leak Test)
```

### Table Categories
- **Transaction Tables**: OP10, OP20, OP30, OP50, OP60, OP80, Report
- **Master/Config Tables**: Tolerance_Setting, Tol_Setting, Recipe_Master, Variant_Master
- **Counter Tables**: OP10_CNTR, OP20_CNTR, OP30_CNTR, OP50_CNTR, OP60_CNTR, OP80_CNTR, OP80_CNTR_TRQ
- **Control Tables**: OP10_Tags, OP20_Tags, OP30_Tags, OP50_Tags, OP60_Tags, OP80_Tags
- **System Tables**: PLC_IP_Address
- **Historical Tables**: Shift_Counter_Log, Paste Errors

---

## Table-by-Table Analysis

### 1. **Tolerance_Setting** (Configuration Table)

| Column | Type | Purpose |
|--------|------|---------|
| Variant1 | NVARCHAR(255) | Part variant identifier (e.g., "K274319") |
| OP50Plug_Status | NVARCHAR(255) | Plug presence check threshold |
| OP50NG_Voss | NVARCHAR(255) | Voss fitting check param |
| OP10Min_LVDT | FLOAT | Lower spec limit for OP10 LVDT measurement |
| OP10Max_LVDT | FLOAT | Upper spec limit for OP10 LVDT measurement |
| OP20AMin_LVDT | FLOAT | Lower spec for OP20 position A LVDT |
| OP20AMax_LVDT | FLOAT | Upper spec for OP20 position A LVDT |
| OP20BMin_LVDT | FLOAT | Lower spec for OP20 position B LVDT |
| OP20BMax_LVDT | FLOAT | Upper spec for OP20 position B LVDT |
| OP30AMin_LVDT | FLOAT | OP30 position A LVDT lower limit |
| OP30AMax_LVDT | FLOAT | OP30 position A LVDT upper limit |
| OP30BMin_Spring | FLOAT | OP30 spring load lower limit |
| OP30BMax_Spring | FLOAT | OP30 spring load upper limit |
| OP50AMin_LVDT | FLOAT | OP50 position A LVDT lower limit |
| OP50AMax_LVDT | FLOAT | OP50 position A LVDT upper limit |
| OP50BMin_Stud | FLOAT | Stud measurement lower limit |
| OP50BMax_Stud | FLOAT | Stud measurement upper limit |
| OP50BMin_Adaptor | FLOAT | Adaptor measurement lower limit |
| OP50BMax_Stud_Adaptor | FLOAT | Adaptor measurement upper limit |
| OP50Min_Torque | FLOAT | Torque lower limit |
| OP50Max_Torque | FLOAT | Torque upper limit |
| OP50Min_NG8Voss | FLOAT | NG8 Voss fitting lower limit |
| OP50Max_NG8Voss | FLOAT | NG8 Voss fitting upper limit |
| OP60AMin_Leak | FLOAT | Leak test lower limit |
| OP60AMax_Leak | FLOAT | Leak test upper limit |
| OP60AMin_LeakRate | FLOAT | Leak rate lower limit |
| OP60AMax_LeakRate | FLOAT | Leak rate upper limit |
| OP60BMin_Cartage | FLOAT | Cartridge torque lower limit |
| OP60BMax_Cartage | FLOAT | Cartridge torque upper limit |
| OP70Min_Leak | FLOAT | OP70 leak lower limit |
| OP70Max_Leak | FLOAT | OP70 leak upper limit |

**Dashboard Usage:**
- **Source for control limits** in all SPC charts
- **Configuration panel**: Show current tolerances vs. recipe master tolerances
- **Audit trail**: Track tolerance changes over time

---

### 2. **OP10** (First Operation - Initial Assembly/Testing)

| Column | Type | Purpose |
|--------|------|---------|
| Sr_No | NVARCHAR(255) | Serial number |
| DateTime1 | NVARCHAR(255) | Human-readable timestamp |
| DateTime2 | FLOAT | Numeric timestamp (OLE Automation date) |
| lvdt_Data | FLOAT | LVDT sensor reading (displacement measurement) |
| lvdt_Status | NVARCHAR(255) | PASS/FAIL for LVDT |
| Camera_Status | NVARCHAR(255) | Vision inspection result |
| Spring_Data | FLOAT | Spring load measurement |
| Spring_Status | NVARCHAR(255) | PASS/FAIL for spring |
| Result | NVARCHAR(255) | Overall station result |
| Iteration1 | INT | Rework attempt number (0=first try) |
| Barcode | NVARCHAR(255) | Part tracking barcode |

**Dashboard Usage:**

#### SPC Charts:
1. **LVDT Control Chart**
   - X-axis: `DateTime2` or `DateTime1`
   - Y-axis: `lvdt_Data`
   - Control Limits: From `Tolerance_Setting.OP10Min_LVDT` / `OP10Max_LVDT`
   - Color code: Green (within spec), Red (out of spec)

2. **Spring Load Control Chart**
   - X-axis: `DateTime2`
   - Y-axis: `Spring_Data`
   - Control Limits: From `Recipe_Master.OP10_SL_Min` / `OP10_SL_Max`

3. **Histogram - LVDT Distribution**
   - X-axis: LVDT value bins
   - Y-axis: Frequency count
   - Overlay: Normal curve, USL/LSL lines

#### Production Charts:
1. **Yield Pie Chart**
   - Query: `COUNT(*) WHERE Result='PASS'` vs `COUNT(*) WHERE Result='FAIL'`
   - Display: Pass %, Fail %

2. **Failure Pareto**
   - X-axis: Failure type (`lvdt_Status='FAIL'`, `Camera_Status='FAIL'`, `Spring_Status='FAIL'`)
   - Y-axis: Count
   - Cumulative % line

3. **Rework Analysis**
   - X-axis: `Iteration1` (0, 1, 2, 3...)
   - Y-axis: COUNT(*)
   - Shows: How many parts needed multiple attempts

---

### 3. **OP20** (Second Operation)

| Column | Type | Purpose |
|--------|------|---------|
| DateTime2 | FLOAT | Timestamp |
| LVDT_A | FLOAT | Position A displacement |
| LVDT_B | FLOAT | Position B displacement |
| Iteration1 | INT | Rework count |
| Spring_Value | FLOAT | Spring measurement |
| Barcode | NVARCHAR(255) | Part ID |
| DateTime1 | NVARCHAR(255) | Human timestamp |
| LVDT_Result | NVARCHAR(10) | LVDT A result |
| Camera_A_Result | NVARCHAR(10) | Camera A inspection |
| LVDT_B_Result | NVARCHAR(10) | LVDT B result |
| Camera_B_Result | NVARCHAR(10) | Camera B inspection |
| Result | NVARCHAR(10) | Overall result |
| Spring_Result | NVARCHAR(10) | Spring test result |

**Dashboard Usage:**

#### SPC Charts:
1. **Dual LVDT Chart** (Side-by-side or overlay)
   - Chart 1: `LVDT_A` vs time
   - Chart 2: `LVDT_B` vs time
   - Limits from: `Recipe_Master.OP20_LVDTA_Min/Max` and `OP20_LVDTB_Min/Max`

2. **Scatter Plot - Correlation**
   - X-axis: `LVDT_A`
   - Y-axis: `LVDT_B`
   - Purpose: Check if A and B measurements correlate (quality indicator)

3. **Spring Load Trend**
   - X-axis: Time
   - Y-axis: `Spring_Value`
   - Limits: `Recipe_Master.OP20_SL_Min/Max`

#### Production Charts:
1. **Multi-Factor Yield**
   - Stacked bar: Camera A, Camera B, LVDT A, LVDT B failures
   - Shows: Which inspection fails most

---

### 4. **OP30** (Third Operation)

| Column | Type | Purpose |
|--------|------|---------|
| Barcode | NVARCHAR(255) | Part ID |
| DateTime1 | NVARCHAR(255) | Timestamp |
| DateTime2 | FLOAT | Numeric timestamp |
| LVDT_Actual_A | FLOAT | Position A measurement |
| LVDT_Result_A | NVARCHAR(255) | Position A result |
| Spring_Load_Actual_B | FLOAT | Spring force at position B |
| Spring_Result_B | NVARCHAR(255) | Spring result |
| Result | NVARCHAR(255) | Overall result |
| Sr_No_Iteration | INT | Rework count |

**Dashboard Usage:**

#### SPC Charts:
1. **LVDT Position A Chart**
   - Y-axis: `LVDT_Actual_A`
   - Limits: `Recipe_Master.OP30_LVDT_Min/Max`

2. **Spring Load Chart**
   - Y-axis: `Spring_Load_Actual_B`
   - Limits: `Recipe_Master.OP30_SL_Min/Max`

3. **Process Capability (Cpk)**
   - Calculate for both LVDT_A and Spring_Load_B
   - Target: Cpk > 1.33

#### Production Charts:
1. **Daily Production Volume**
   - X-axis: `CAST(DateTime1 AS DATE)`
   - Y-axis: COUNT(*)

---

### 5. **OP50** (Assembly Operation - Torque & Fitting)

| Column | Type | Purpose |
|--------|------|---------|
| Barcode | NVARCHAR(255) | Part ID |
| DateTime1 | NVARCHAR(255) | Timestamp |
| DateTime2 | FLOAT | Numeric timestamp |
| LVDT_Actual | FLOAT | Position measurement |
| LVDT_Result | NVARCHAR(255) | LVDT result |
| Result | NVARCHAR(255) | Overall result |
| Sr_No_Iteration | INT | Rework count |
| Port1_Result | NVARCHAR(255) | Port 1 torque result |
| Port21_Result | NVARCHAR(255) | Port 2/1 torque result |
| Port4_Angle | NVARCHAR(255) | Port 4 angle |
| Port1_Torque | NVARCHAR(255) | Port 1 torque value |
| Port1_Angle | NVARCHAR(255) | Port 1 angle |
| Port21_Torque | NVARCHAR(255) | Port 2/1 torque |
| Port21_Angle | NVARCHAR(255) | Port 2/1 angle |
| Port4_Torque | NVARCHAR(255) | Port 4 torque |
| Port4_Result | NVARCHAR(255) | Port 4 result |

**Dashboard Usage:**

#### SPC Charts:
1. **Torque Distribution Histogram**
   - Create 3 charts: Port 1, Port 21, Port 4 torque distributions
   - Convert NVARCHAR to FLOAT for analysis

2. **Angle vs Torque Scatter**
   - X-axis: Torque (converted to FLOAT)
   - Y-axis: Angle (converted to FLOAT)
   - Separate by port
   - Shows: Torque-angle relationship (should be consistent)

3. **Multi-Port Performance**
   - X-axis: Port number
   - Y-axis: Pass rate %
   - Shows: Which port fails most frequently

#### Production Charts:
1. **Port Failure Pareto**
   - X-axis: Port 1, Port 21, Port 4
   - Y-axis: Failure count
   - Shows: Problem port identification

---

### 6. **OP60** (Torque Operation)

| Column | Type | Purpose |
|--------|------|---------|
| Barcode | NVARCHAR(255) | Part ID |
| DateTime1 | NVARCHAR(255) | Timestamp |
| DateTime2 | FLOAT | Numeric timestamp |
| Cartage_Torque_Result | NVARCHAR(255) | Cartridge torque result |
| Result | NVARCHAR(255) | Overall result |
| Sr_No_Iteration | INT | Rework count |
| Torque_Result | NVARCHAR(255) | Torque test result |

**Dashboard Usage:**

#### Production Charts:
1. **Pass/Fail Trend**
   - X-axis: Time (hourly buckets)
   - Y-axis: Pass rate %
   - Shows: Time-based quality patterns

2. **Iteration Analysis**
   - X-axis: Iteration number
   - Y-axis: Count
   - Shows: First-time quality vs rework

---

### 7. **OP80** (Final Test - Leak & Pressure)

| Column | Type | Purpose |
|--------|------|---------|
| Barcode | NVARCHAR(255) | Part ID |
| DateTime1 | NVARCHAR(255) | Timestamp |
| DateTime2 | FLOAT | Numeric timestamp |
| PT1_Result | NVARCHAR(255) | Pressure transducer 1 result |
| A1 | FLOAT | Measurement A1 |
| T1_Result | NVARCHAR(255) | T1 result |
| T2 | FLOAT | Temperature/Time 2 |
| A2 | FLOAT | Measurement A2 |
| A2_Result | NVARCHAR(255) | A2 result |
| T3 | FLOAT | Temperature/Time 3 |
| A3 | FLOAT | Measurement A3 |
| A3_Result | NVARCHAR(255) | A3 result |
| Result | NVARCHAR(255) | Overall result |
| Sr_No_Iteration | INT | Rework count |
| PT1 | FLOAT | Pressure 1 actual |
| PT2 | FLOAT | Pressure 2 actual |
| T1 | FLOAT | Time/Temp 1 |
| Leak_Actual | FLOAT | Leak measurement |
| Leak_Result | NVARCHAR(255) | Leak test result |
| Delta_PT2 | FLOAT | Pressure drop |
| Delta_PT2_Result | NVARCHAR(255) | Pressure drop result |

**Dashboard Usage:**

#### SPC Charts:
1. **PT1 Pressure Control Chart**
   - Y-axis: `PT1`
   - Limits: `Recipe_Master.PT1_Min/Max`

2. **PT2 Pressure Control Chart**
   - Y-axis: `PT2`
   - Limits: `Recipe_Master.PT2_Min/Max`

3. **Leak Rate Chart**
   - Y-axis: `Leak_Actual`
   - Shows: Leak performance over time

4. **Delta PT2 Chart**
   - Y-axis: `Delta_PT2`
   - Limits: `Recipe_Master.DELTA_PT2`
   - Critical: High values indicate leaks

#### Advanced Analytics:
1. **Leak Prediction Model**
   - Inputs: PT1, PT2, T1, T2, T3
   - Output: Predict leak risk
   - Algorithm: Regression or ML model

2. **Multi-Variable Correlation**
   - Matrix: PT1 vs PT2 vs Leak_Actual
   - Heatmap showing correlations

---

### 8. **Recipe_Master** (Master Configuration Table)

| Column | Type | Purpose |
|--------|------|---------|
| KBPartNo | NVARCHAR(255) | Part number |
| Customer | NVARCHAR(255) | Customer name |
| CustomerNo | NVARCHAR(255) | Customer number |
| BarcodeLength | INT | Expected barcode length |
| OP10_LVDT_Min | FLOAT | **OP10 LVDT lower spec** |
| OP10_LVDT_Max | FLOAT | **OP10 LVDT upper spec** |
| OP10_SL_Min | FLOAT | **OP10 spring load lower** |
| OP10_SL_Max | FLOAT | **OP10 spring load upper** |
| OP20_LVDTA_Min | FLOAT | **OP20 LVDT A lower** |
| OP20_LVDTA_Max | FLOAT | **OP20 LVDT A upper** |
| OP20_SL_Min | FLOAT | **OP20 spring load lower** |
| OP20_SL_Max | FLOAT | **OP20 spring load upper** |
| OP20_LVDTB_Min | FLOAT | **OP20 LVDT B lower** |
| OP20_LVDTB_Max | FLOAT | **OP20 LVDT B upper** |
| OP30_LVDT_Min | FLOAT | **OP30 LVDT lower** |
| OP30_LVDT_Max | FLOAT | **OP30 LVDT upper** |
| OP30_SL_Min | FLOAT | **OP30 spring load lower** |
| OP30_SL_Max | FLOAT | **OP30 spring load upper** |
| OP50_Port1 | NVARCHAR(255) | Port 1 configuration |
| OP50_Port21 | NVARCHAR(255) | Port 2/1 configuration |
| OP50_4_23 | NVARCHAR(255) | Port 4/23 configuration |
| OP50_LVDT_Min | FLOAT | **OP50 LVDT lower** |
| OP50_LVDT_Max | FLOAT | **OP50 LVDT upper** |
| OP60_Torque_Min | NVARCHAR(255) | **OP60 torque lower** |
| OP60_Torque_Max | NVARCHAR(255) | **OP60 torque upper** |
| PT1_Min | FLOAT | **Pressure 1 lower** |
| PT1_Max | FLOAT | **Pressure 1 upper** |
| PT2_Min | FLOAT | **Pressure 2 lower** |
| PT2_Max | FLOAT | **Pressure 2 upper** |
| OP70_Desourter | INT | Desourter setting |
| Set1, Set2, Set3 | FLOAT | Configuration sets |
| PORT1_CYL | INT | Port 1 cylinder |
| DELTA_PT1 | FLOAT | **Pressure 1 delta spec** |
| DELTA_PT2 | FLOAT | **Pressure 2 delta spec** |
| CTS_CUT_OFF | FLOAT | Cut-off threshold |
| EPPR1, EPPR2 | FLOAT | EPPR parameters |
| Model_No | INT | Model identifier |

**Dashboard Usage:**
- **Primary source for all control limits**
- **Recipe comparison dashboard**: Show active recipe vs historical
- **Multi-part analysis**: Compare specs for different part numbers

---

### 9. **Report** (Master Reporting Table - ALL Operations Combined)

**Purpose:** This is the GOLDMINE table - contains all operation data for a complete part journey.

**Structure:** 
- OP10 columns: `Sr_No`, `DateTime1`, `lvdt_Data`, `lvdt_Status`, `Camera_Status`, `Spring_Data`, `Result`, `Iteration1`, `Barcode`
- OP20 columns: `Barcode_OP20`, `DateTime1_OP20`, `LVDT_A_OP20`, `LVDT_Result_OP20`, `Camera_A_Result_OP20`, `LVDT_B_OP20`, `Result_OP20`, etc.
- OP30 columns: `Barcode_OP30`, `DateTime1_OP30`, `LVDT_Actual_A_OP30`, `Result_OP30`, etc.
- OP50 columns: `Barcode_OP50`, `DateTime1_OP50`, `LVDT_Actual_OP50`, `Port1_Torque_OP50`, `Result_OP50`, etc.
- OP60 columns: `Barcode_OP60`, `DateTime1_OP60`, `Result_OP60`, etc.
- OP80 columns: `Barcode_OP80`, `DateTime1_OP80`, `PT1_OP80`, `PT2_OP80`, `Leak_Actual_OP80`, `Result_OP80`, etc.

**Dashboard Usage:**

#### Process Flow Analysis:
1. **Waterfall Chart - First Pass Yield**
   ```
   Total Parts → OP10 Pass → OP20 Pass → OP30 Pass → OP50 Pass → OP60 Pass → OP80 Pass
   ```
   - X-axis: Station names
   - Y-axis: Cumulative part count
   - Shows: Where defects occur most

2. **Station Yield Comparison**
   - X-axis: Station (OP10, OP20, OP30, OP50, OP60, OP80)
   - Y-axis: Pass rate %
   - Query: `COUNT(*) WHERE Result_OPxx = 'PASS' / COUNT(*)`

3. **Cycle Time Analysis**
   - Calculate: `DateTime2_OP20 - DateTime2` = OP10→OP20 cycle time
   - Create histogram of cycle times between stations
   - Identify bottlenecks

4. **Defect Propagation Matrix**
   - Rows: OP10 defects
   - Columns: Where they're caught (OP20, OP30, etc.)
   - Heatmap showing escape rates

#### Part Genealogy:
1. **Part Journey Timeline**
   - For a single barcode, show timeline:
   - OP10 (time, result) → OP20 (time, result) → ... → OP80 (time, result)
   - Visualization: Gantt chart or timeline

---

### 10. **OP10_CNTR, OP20_CNTR, OP30_CNTR, OP50_CNTR, OP60_CNTR, OP80_CNTR** (Live Counters)

**Structure (same for all):**
| Column | Type | Purpose |
|--------|------|---------|
| OK1 | INT | Total pass count |
| NOTOK1 | INT | Total fail count |
| Total1 | INT | Total tested |

**Dashboard Usage:**

#### Real-Time KPI Cards:
1. **Current Shift Performance**
   - Display per station:
     - Total: `Total1`
     - Pass: `OK1`
     - Fail: `NOTOK1`
     - Yield: `(OK1/Total1) * 100`

2. **Station Comparison Bar Chart**
   - X-axis: Stations (OP10-OP80)
   - Y-axis: Count
   - Stacked bars: Green (OK1), Red (NOTOK1)

3. **Defect Rate Speedometer**
   - Display: `(NOTOK1/Total1) * 100`
   - Color zones: Green (<1%), Yellow (1-5%), Red (>5%)

---

### 11. **OP80_CNTR_TRQ** (OP80 Torque-Specific Counter)

Same structure as other counters, but specific to torque tests at OP80.

**Dashboard Usage:**
- Compare OP80 general vs torque-specific failures
- Identify if torque is the primary failure mode

---

### 12. **Shift_Counter_Log** (Historical Shift Data)

| Column | Type | Purpose |
|--------|------|---------|
| OK1 | INT | Shift pass count |
| NOTOK1 | INT | Shift fail count |
| Total1 | INT | Shift total |
| DateTime1 | NVARCHAR(255) | Shift date |
| DateTime2 | FLOAT | Numeric timestamp |
| Station1 | NVARCHAR(255) | Station name |
| Shift1 | NVARCHAR(255) | Shift identifier |

**Dashboard Usage:**

#### Trend Analysis:
1. **Shift Performance Trend**
   - X-axis: `DateTime1` (group by shift)
   - Y-axis: Yield % = `(OK1/Total1) * 100`
   - Multiple lines: One per station
   - Shows: Performance trends over days/weeks

2. **Shift Comparison**
   - X-axis: Shift (Day, Evening, Night)
   - Y-axis: Average yield
   - Box plot or bar chart
   - Shows: Which shift performs best

3. **Production Volume Trend**
   - X-axis: Date
   - Y-axis: `Total1` (sum by day)
   - Area chart
   - Shows: Production volume over time

4. **Heatmap - Station x Shift Performance**
   - Rows: Stations
   - Columns: Shifts
   - Color: Yield %
   - Shows: Best/worst station-shift combinations

---

### 13. **Variant_Master** (Part Variant Configuration)

| Column | Type | Purpose |
|--------|------|---------|
| Variant1 | NVARCHAR(255) | Variant ID |
| KB_Part | NVARCHAR(255) | KB part number |
| Enable1 | NVARCHAR(255) | Enabled flag |
| Barcode_Length | NVARCHAR(255) | Expected barcode length |

**Dashboard Usage:**
- **Variant selector dropdown**: Filter all dashboards by variant
- **Multi-variant comparison**: Side-by-side yield comparison

---

### 14. **Tol_Setting** (Detailed Tolerance Configuration)

| Column | Type | Purpose |
|--------|------|---------|
| Variant1 | NVARCHAR(255) | Variant ID |
| Station_Name | NVARCHAR(255) | Station (OP10, OP20, etc.) |
| Parameter_Name | NVARCHAR(255) | Parameter name |
| Data_Type | NVARCHAR(255) | Data type |
| Value1 | NVARCHAR(255) | Tolerance value |
| Modbus_Address | NVARCHAR(255) | PLC address |
| Multiplier | NVARCHAR(255) | Scaling factor |
| Offset | NVARCHAR(255) | Offset value |
| Sr_No | INT | Sequence |

**Dashboard Usage:**
- **Tolerance audit dashboard**: Show all active tolerances
- **Parameter tree**: Hierarchical view of station → parameters → values
- **Change tracking**: If you add timestamps, track tolerance changes

---

### 15. **OP10_Tags, OP20_Tags, OP30_Tags, OP50_Tags, OP60_Tags, OP80_Tags** (PLC Control Tags)

**Purpose:** Real-time PLC communication flags (likely for SCADA integration).

**Dashboard Usage:**
- **System health dashboard**: Monitor PLC communication status
- **Cycle completion tracking**: Monitor `CycleComp_Data_Store` flags
- Usually not for production analysis, but for system monitoring

---

### 16. **Paste Errors** (Error Log)

| Column | Type | Purpose |
|--------|------|---------|
| Barcode | NVARCHAR(255) | Part with error |
| DateTime1 | NVARCHAR(255) | Error time |
| DateTime2 | FLOAT | Numeric timestamp |
| Cartage_Torque_Result | NVARCHAR(255) | Torque result |
| Torque_Result | NVARCHAR(255) | General torque result |
| Result | NVARCHAR(255) | Overall result |
| Sr_No_Iteration | INT | Iteration |

**Dashboard Usage:**
- **Error log table**: Searchable table of all errors
- **Error frequency chart**: Count of errors by hour/day
- **Error type Pareto**: Most common error types

---

### 17. **PLC_IP_Address** (System Configuration)

| Column | Type | Purpose |
|--------|------|---------|
| OP10_IP through OP80_IP | NVARCHAR(255) | Station PLC IPs |
| Zebra_IP | NVARCHAR(255) | Barcode printer IP |
| Desourter_IP | NVARCHAR(255) | Torque tool IP |
| Cincinnati_IP | NVARCHAR(255) | Equipment IP |
| Ateq_ComPort | NVARCHAR(255) | Leak tester COM port |
| PLCSerial_ComPort | NVARCHAR(255) | PLC serial COM port |

**Dashboard Usage:**
- **System config panel**: Display network topology
- **Health monitoring**: Ping IPs to check connectivity
- Not typically visualization data

---

## SPC Dashboard Design

### **Dashboard Layout: 1920x1080 Resolution**

#### **Page 1: Real-Time SPC Monitoring**

```
┌─────────────────────────────────────────────────────────────┐
│  STATION: [OP10 ▼]   VARIANT: [K274319 ▼]   SHIFT: [Day ▼] │
│  Live Since: 06:00 AM    Last Updated: 10:45:23              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │   LVDT Control Chart     │  │  Spring Load Chart       │ │
│  │  ─────────────           │  │  ─────────────           │ │
│  │   UCL: 10.5   ————       │  │   UCL: 275.0  ————       │ │
│  │              ────────     │  │            ──────────    │ │
│  │   Target:───────────      │  │   Target:─────────────   │ │
│  │          ──────────       │  │         ──────────       │ │
│  │   LCL: 9.0    ────        │  │   LCL: 245.0   ───       │ │
│  │   Time: 06:00 → 10:45    │  │   Time: 06:00 → 10:45   │ │
│  │   Cpk: 1.52 ✓            │  │   Cpk: 1.33 ✓           │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Current Cpk │  │ Distribution │  │  Defect Pareto   │   │
│  │  OP10: 1.52 │  │   ╱───╲      │  │  LVDT: ████ 45%  │   │
│  │  OP20: 1.48 │  │  ╱     ╲     │  │  Camera: ██ 30%  │   │
│  │  OP30: 1.41 │  │ ╱       ╲    │  │  Spring: █ 25%   │   │
│  │  OP50: 1.67 │  │            →  │  │                  │   │
│  │  OP60: 1.39 │  └──────────────┘  └──────────────────┘   │
│  │  OP80: 1.44 │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
1. **Header**: Filters + live status
2. **Main Charts** (2 large): Primary parameter control charts
3. **Cpk Card**: All stations' capability index
4. **Distribution**: Histogram of selected parameter
5. **Pareto**: Top failure causes

---

#### **Page 2: Multi-Station Overview**

```
┌─────────────────────────────────────────────────────────────┐
│  SPC Dashboard - All Stations                 Date: 2024-Jan-26│
├─────────────────────────────────────────────────────────────┤
│  OP10                    OP20                   OP30          │
│  ┌────────────────┐     ┌────────────────┐    ┌───────────┐ │
│  │ LVDT: ──── ✓   │     │ LVDT A: ──── ✓ │    │ LVDT:──── │ │
│  │ Spring: ──── ✓ │     │ LVDT B: ──── ✓ │    │ Spring:── │ │
│  └────────────────┘     └────────────────┘    └───────────┘ │
│                                                               │
│  OP50                    OP60                   OP80          │
│  ┌────────────────┐     ┌────────────────┐    ┌───────────┐ │
│  │ Port 1: ──── ⚠ │     │ Torque: ──── ✓ │    │ PT1: ──── │ │
│  │ Port 21: ──── ✓│     └────────────────┘    │ PT2: ──── │ │
│  │ Port 4: ──── ✓ │                           │ Leak: ─── │ │
│  └────────────────┘                           └───────────┘ │
│                                                               │
│  ┌──── Capability Summary ────────────────────────────────┐ │
│  │  OP10  OP20  OP30  OP50  OP60  OP80                    │ │
│  │  ████  ████  ███   ████  ███   ████   < Cpk Bars      │ │
│  │  1.52  1.48  1.41  1.67  1.39  1.44                    │ │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Production Dashboard Design

### **Dashboard Layout: Production Metrics**

#### **Page 1: Live Production**

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION DASHBOARD - LIVE                  Shift: Day 1   │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │  TOTAL     │ │  PASS      │ │  FAIL      │ │  YIELD   ││
│  │   1,847    │ │   1,756    │ │    91      │ │  95.1%   ││
│  │  ↑ 12%     │ │  ↑ 15%     │ │  ↓ -8%     │ │  ↑ 0.5%  ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                               │
│  ┌──── Production by Station ─────────────────────────────┐ │
│  │  OP10 ████████████ 298                                 │ │
│  │  OP20 ████████████ 295                                 │ │
│  │  OP30 ████████████ 301                                 │ │
│  │  OP50 ████████████ 289                                 │ │
│  │  OP60 ████████████ 312                                 │ │
│  │  OP80 ████████████ 352                                 │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──── Hourly Production Rate ────────────────────────────┐ │
│  │  400│                                                   │ │
│  │  300│        ╱╲  ╱╲                                     │ │
│  │  200│    ╱╲╱  ╲╱  ╲╱╲                                   │ │
│  │  100│ ╱╲╱                                               │ │
│  │    0└───────────────────────────────────────────→      │ │
│  │      6AM  8AM  10AM  12PM  2PM  4PM                    │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──── Station Yield Comparison ─────┐  ┌─── Top Defects ─┐│
│  │  OP10 ████████████████ 97.2%      │  │ LVDT Fail : 35  ││
│  │  OP20 ███████████████  95.8%      │  │ Leak Fail : 28  ││
│  │  OP30 ████████████████ 96.1%      │  │ Torque Fail: 18 ││
│  │  OP50 ██████████████   93.5% ⚠    │  │ Spring Fail: 10 ││
│  │  OP60 ████████████████ 96.8%      │  └─────────────────┘│
│  │  OP80 ███████████████  95.2%      │                      │
│  └───────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**Query Examples:**

```sql
-- KPI Card: Total Production
SELECT COUNT(*) as Total FROM OP10 
WHERE CAST(DateTime1 AS DATE) = CAST(GETDATE() AS DATE)

-- KPI Card: Yield
SELECT 
  (CAST(SUM(CASE WHEN Result='PASS' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as Yield
FROM OP10 
WHERE CAST(DateTime1 AS DATE) = CAST(GETDATE() AS DATE)

-- Hourly Production Rate
SELECT 
  DATEPART(HOUR, DateTime2) as Hour,
  COUNT(*) as Count
FROM OP10
WHERE CAST(DateTime1 AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY DATEPART(HOUR, DateTime2)
ORDER BY Hour
```

---

#### **Page 2: Historical Trends**

```
┌─────────────────────────────────────────────────────────────┐
│  HISTORICAL PRODUCTION ANALYSIS                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──── 30-Day Yield Trend ────────────────────────────────┐ │
│  │ 100%│                                                   │ │
│  │  98%│  ─────  ────── ────────                          │ │
│  │  96%│ ╱     ╲╱      ╲                                  │ │
│  │  94%│╱                ╲    ╱                           │ │
│  │  92%│                  ╲ ╱                             │ │
│  │   0%└────────────────────────────────────────────→     │ │
│  │     Jan 1    Jan 10    Jan 20    Jan 30              │ │
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──── Shift Comparison ──────────┐  ┌─ Part Mix ─────────┐│
│  │        Day    Evening   Night   │  │ K274319: 65%  ████ ││
│  │ Yield  96.2%  94.1%    92.8%   │  │ K274320: 25%  ██   ││
│  │ Volume 1,200   850      620     │  │ K286480: 10%  █    ││
│  └─────────────────────────────────┘  └────────────────────┘│
│                                                               │
│  ┌──── Rework Analysis ────────────────────────────────────┐│
│  │  Iteration 0 (1st Try):  ████████████████ 92.3%        ││
│  │  Iteration 1 (Rework 1): ██ 6.5%                       ││
│  │  Iteration 2 (Rework 2): █ 1.0%                        ││
│  │  Iteration 3+ (Multiple):  0.2%                        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Query:**

```sql
-- Shift Comparison
SELECT 
  Shift1,
  SUM(OK1) as Total_Pass,
  SUM(Total1) as Total_Parts,
  (CAST(SUM(OK1) AS FLOAT) / SUM(Total1)) * 100 as Yield
FROM Shift_Counter_Log
WHERE DateTime1 >= DATEADD(day, -30, GETDATE())
GROUP BY Shift1

-- Rework Analysis
SELECT 
  Iteration1,
  COUNT(*) as Count,
  (CAST(COUNT(*) AS FLOAT) / (SELECT COUNT(*) FROM OP10)) * 100 as Percentage
FROM OP10
GROUP BY Iteration1
ORDER BY Iteration1
```

---

## Advanced Analytics

### **1. Process Flow Waterfall**

**Table:** `Report`

**Chart Type:** Waterfall or Sankey diagram

**Query:**
```sql
SELECT 
  SUM(CASE WHEN Result = 'PASS' THEN 1 ELSE 0 END) as OP10_Pass,
  SUM(CASE WHEN Result_OP20 = 'PASS' AND Result = 'PASS' THEN 1 ELSE 0 END) as OP20_Pass,
  SUM(CASE WHEN Result_OP30 = 'PASS' AND Result_OP20 = 'PASS' AND Result = 'PASS' THEN 1 ELSE 0 END) as OP30_Pass,
  SUM(CASE WHEN Result_OP50 = 'PASS' AND Result_OP30 = 'PASS' AND Result_OP20 = 'PASS' AND Result = 'PASS' THEN 1 ELSE 0 END) as OP50_Pass,
  SUM(CASE WHEN Result_OP60 = 'PASS' AND Result_OP50 = 'PASS' AND Result_OP30 = 'PASS' AND Result_OP20 = 'PASS' AND Result = 'PASS' THEN 1 ELSE 0 END) as OP60_Pass,
  SUM(CASE WHEN Result_OP80 = 'PASS' AND Result_OP60 = 'PASS' AND Result_OP50 = 'PASS' AND Result_OP30 = 'PASS' AND Result_OP20 = 'PASS' AND Result = 'PASS' THEN 1 ELSE 0 END) as OP80_Pass,
  COUNT(*) as Total_Started
FROM Report
WHERE CAST(DateTime1 AS DATE) = CAST(GETDATE() AS DATE)
```

---

### **2. Correlation Analysis**

**Purpose:** Identify which measurements correlate with final failures

**Example: OP10 LVDT vs Final Result**

```sql
SELECT 
  op10.lvdt_Data,
  op80.Leak_Actual,
  op80.Result as Final_Result
FROM OP10 op10
JOIN Report r ON op10.Barcode = r.Barcode
JOIN OP80 op80 ON r.Barcode_OP80 = op80.Barcode
WHERE op80.Result IS NOT NULL
```

**Visualization:**
- Scatter plot: X = OP10 LVDT, Y = OP80 Leak, Color = Pass/Fail
- Shows: If early measurements predict later failures

---

### **3. Cycle Time Analysis**

**Query:**
```sql
SELECT 
  Barcode,
  DateTime2 as OP10_Time,
  DateTime2_OP20 as OP20_Time,
  DateTime2_OP30 as OP30_Time,
  DateTime2_OP50 as OP50_Time,
  DateTime2_OP60 as OP60_Time,
  DateTime2_OP80 as OP80_Time,
  (DateTime2_OP20 - DateTime2) * 24 * 60 as OP10_to_OP20_Minutes,
  (DateTime2_OP30 - DateTime2_OP20) * 24 * 60 as OP20_to_OP30_Minutes,
  (DateTime2_OP50 - DateTime2_OP30) * 24 * 60 as OP30_to_OP50_Minutes,
  (DateTime2_OP60 - DateTime2_OP50) * 24 * 60 as OP50_to_OP60_Minutes,
  (DateTime2_OP80 - DateTime2_OP60) * 24 * 60 as OP60_to_OP80_Minutes
FROM Report
WHERE DateTime2 IS NOT NULL 
  AND DateTime2_OP80 IS NOT NULL
```

**Visualization:**
- Box plot: Y = Cycle time, X = Station transition
- Histogram: Distribution of cycle times
- Identifies bottlenecks

---

### **4. Defect Escape Analysis**

**Purpose:** Find defects caught at later stations that should have been caught earlier

**Query:**
```sql
-- Parts that failed OP80 but passed OP10-OP60
SELECT 
  Barcode,
  Result as OP10_Result,
  Result_OP20,
  Result_OP30,
  Result_OP50,
  Result_OP60,
  Result_OP80
FROM Report
WHERE Result = 'PASS'
  AND Result_OP20 = 'PASS'
  AND Result_OP30 = 'PASS'
  AND Result_OP50 = 'PASS'
  AND Result_OP60 = 'PASS'
  AND Result_OP80 = 'FAIL'
```

**Visualization:**
- Sankey diagram showing defect flow
- Heatmap: Row = caught at station, Column = originated at station

---

### **5. Predictive Quality Model**

**Purpose:** Predict final test result based on earlier measurements

**Features:**
- OP10: lvdt_Data, Spring_Data
- OP20: LVDT_A, LVDT_B, Spring_Value
- OP30: LVDT_Actual_A, Spring_Load_Actual_B
- OP50: LVDT_Actual, Port torques

**Target:**
- OP80 Result (PASS/FAIL)

**Algorithm:**
- Logistic Regression or Random Forest
- Train on historical `Report` table data
- Deploy as real-time scoring

**Dashboard:**
- Risk score per part in OP10-OP60
- Flag high-risk parts for additional inspection

---

## Summary: Complete Dashboard Suite

### **Dashboard 1: Real-Time SPC**
- Live control charts (6 stations, primary parameters)
- Cpk monitoring
- Defect Pareto
- Alert notifications

### **Dashboard 2: Production Metrics**
- KPI cards (Yield, Volume, Defect Rate)
- Hourly/daily production trends
- Station comparison
- Shift analysis

### **Dashboard 3: Quality Deep Dive**
- Multi-parameter correlation analysis
- Process flow waterfall
- Defect escape tracking
- Capability studies (Cp, Cpk, Pp, Ppk)

### **Dashboard 4: Historical Analysis**
- 30/60/90-day trends
- Shift & part variant comparison
- Rework analysis
- Cycle time analysis

### **Dashboard 5: Predictive Quality**
- Risk scoring
- Failure prediction
- Root cause analysis
- Continuous improvement tracking

---

**Total Visualization Count:** 50+ unique charts/graphs possible from this database.

**Recommended Tools:**
- **Power BI / Tableau**: Best for interactive dashboards
- **Grafana**: Good for real-time monitoring
- **Python (Plotly/Dash)**: Custom web dashboards
- **Excel**: Quick prototyping
