/**
 * Mock Data Generator for Plant Production Dashboard
 * Generates realistic time-series and statistical data for testing
 */

// Metadata for dropdowns
export const generateMetadata = () => {
  return {
    plants: [
      { id: 'pune', name: 'Pune Plant' },
      { id: 'chennai', name: 'Chennai Plant' }
    ],
    lines: [
      { id: 'fcpv', name: 'FCPV Line', plant_id: 'pune' },
      { id: 'lacv', name: 'LACV Line', plant_id: 'pune' },
      { id: 'compressor', name: 'Compressor Line', plant_id: 'chennai' }
    ],
    stations_meta: [
      { id: 'op10', name: 'OP-10', line_id: 'fcpv' },
      { id: 'op20', name: 'OP-20', line_id: 'fcpv' },
      { id: 'op30', name: 'OP-30', line_id: 'fcpv' },
      { id: 'op10_lacv', name: 'OP-10', line_id: 'lacv' },
      { id: 'op20_lacv', name: 'OP-20', line_id: 'lacv' },
      { id: 'op10_comp', name: 'OP-10', line_id: 'compressor' }
    ],
    shifts: [
      { id: 'all', name: 'All Shifts' },
      { id: 'A', name: 'Shift A (06:00-14:00)' },
      { id: 'B', name: 'Shift B (14:00-22:00)' },
      { id: 'C', name: 'Shift C (22:00-06:00)' }
    ]
  };
};

// Generate random value within range with some consistency
const randomInRange = (min, max, seed = 0) => {
  const t = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  const random = t - Math.floor(t);
  return min + random * (max - min);
};

// Generate trend value (used for KPI trends)
const generateTrend = (seed = 0) => {
  return randomInRange(-5, 8, seed); // Slightly biased toward positive
};

// Month name lookup
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Resolve actual start/end Date objects from dateRange presets or custom dates.
 */
const resolveDateBounds = (dateRange, startDateStr, endDateStr) => {
  const now = new Date();
  let start, end;

  if (dateRange === 'custom' && startDateStr && endDateStr) {
    start = new Date(startDateStr); start.setHours(0, 0, 0, 0);
    end = new Date(endDateStr); end.setHours(23, 59, 59, 999);
  } else if (dateRange === 'yesterday') {
    start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
    end = new Date(start); end.setHours(23, 59, 59, 999);
  } else if (dateRange === 'last7') {
    end = new Date(now);
    start = new Date(now); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0);
  } else if (dateRange === 'last30') {
    end = new Date(now);
    start = new Date(now); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0);
  } else {
    // 'today' or fallback
    start = new Date(now); start.setHours(0, 0, 0, 0);
    end = new Date(now);
  }

  return { start, end };
};

/**
 * Simple hash from a string to produce a deterministic numeric seed.
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Generate KPI data — date-range-aware so values change per selection
export const generateLineKPI = (filters = {}) => {
  // Derive seed from date range so different dates = different values
  const { dateRange = 'today', startDate, endDate, resolution = 'raw' } = filters;
  const seedStr = `${dateRange}-${startDate || 'x'}-${endDate || 'x'}`;
  const seed = hashString(seedStr);

  // Scale production totals by the time span
  const { start, end } = resolveDateBounds(dateRange, startDate, endDate);
  const spanDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const dailyTarget = 1400; // target per day
  const totalTarget = dailyTarget * spanDays;
  const efficiency = randomInRange(0.78, 0.96, seed);
  const currentProduction = Math.floor(totalTarget * efficiency);

  return {
    production: {
      current: currentProduction,
      target: totalTarget,
      trend: Number(generateTrend(seed).toFixed(1))
    },
    oee: {
      value: Number(randomInRange(75, 92, seed + 1).toFixed(1)),
      trend: Number(generateTrend(seed + 1).toFixed(1))
    },
    rejection: {
      count: Math.floor(randomInRange(8, 25, seed + 2) * Math.sqrt(spanDays))
    },
    efficiency: {
      value: Number(randomInRange(85, 96, seed + 3).toFixed(1))
    }
  };
};

/**
 * Generate time-series data for velocity chart.
 * Date-range aware — generates data only within [startDate, endDate].
 * Resolution determines granularity:
 *   - 'month' → one point per month in the range
 *   - 'day'   → one point per day
 *   - 'shift' → 3 points per day (A/B/C shifts)
 *   - 'hour'  → one point per hour
 *   - 'raw'   → 10-min intervals
 */
export const generateVelocityChart = (resolution = 'raw', startDate = null, endDate = null) => {
  const data = [];
  const targetPerHour = 120;
  // Use provided dates or defaults
  const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
  const end = endDate ? new Date(endDate) : new Date();

  if (resolution === 'month') {
    // Iterate month by month within the range
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    let seed = 0;
    while (cursor <= endMonth) {
      const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
      const monthlyTarget = targetPerHour * 16 * daysInMonth;
      const efficiency = randomInRange(0.78, 0.96, seed);
      data.push({
        time_label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`,
        output: Math.floor(monthlyTarget * efficiency),
        target: monthlyTarget,
      });
      cursor.setMonth(cursor.getMonth() + 1);
      seed++;
    }
  } else if (resolution === 'day') {
    // Iterate day by day within the range
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let seed = 0;
    const dailyTarget = targetPerHour * 16;
    while (cursor <= end) {
      const efficiency = randomInRange(0.78, 0.96, seed);
      data.push({
        time_label: `${cursor.getDate().toString().padStart(2, '0')}/${(cursor.getMonth() + 1).toString().padStart(2, '0')}`,
        output: Math.floor(dailyTarget * efficiency),
        target: dailyTarget,
      });
      cursor.setDate(cursor.getDate() + 1);
      seed++;
    }
  } else if (resolution === 'shift') {
    // 3 shifts per day within the range
    const shiftTarget = targetPerHour * 8;
    const shiftNames = ['A', 'B', 'C'];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let seed = 0;
    while (cursor <= end) {
      const dayStr = `${cursor.getDate().toString().padStart(2, '0')}/${(cursor.getMonth() + 1).toString().padStart(2, '0')}`;
      for (let s = 0; s < 3; s++) {
        const efficiency = randomInRange(0.75, 0.98, seed);
        data.push({
          time_label: `${dayStr} - ${shiftNames[s]}`,
          output: Math.floor(shiftTarget * efficiency),
          target: shiftTarget,
        });
        seed++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (resolution === 'hour') {
    // Hourly within the range
    const cursor = new Date(start);
    let seed = 0;
    while (cursor <= end) {
      data.push({
        time_label: `${cursor.getHours().toString().padStart(2, '0')}:00`,
        output: Math.floor(randomInRange(90, 150, seed)),
        target: targetPerHour,
      });
      cursor.setTime(cursor.getTime() + 60 * 60 * 1000);
      seed++;
    }
  } else {
    // 'raw' — 10-min intervals within the range
    const cursor = new Date(start);
    let seed = 0;
    while (cursor <= end) {
      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      data.push({
        time_label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        output: Math.floor(randomInRange(90, 150, seed)),
        target: targetPerHour,
      });
      cursor.setTime(cursor.getTime() + 10 * 60 * 1000);
      seed++;
    }
  }

  return data;
};

// Generate downtime reasons
export const generateDowntimeReasons = () => {
  const reasons = [
    'Tool Change',
    'No Material',
    'Quality Check',
    'Maintenance',
    'Setup Time',
    'Operator Break'
  ];

  return reasons.slice(0, 3).map((reason, idx) => ({
    reason,
    station: `OP-${(idx + 1) * 10}`,
    duration: Math.floor(randomInRange(5, 60, idx))
  }));
};

// Generate station status data
export const generateStations = (lineId = 'fcpv') => {
  const statuses = ['running', 'idle', 'fault'];
  const operators = ['Auto', 'John', 'Sarah', 'Mike', 'Auto'];

  const stationsForLine = {
    fcpv: ['op10', 'op20', 'op30'],
    lacv: ['op10_lacv', 'op20_lacv'],
    compressor: ['op10_comp']
  };

  const stationIds = stationsForLine[lineId] || stationsForLine.fcpv;

  return stationIds.map((id, idx) => {
    const status = idx === 1 ? 'fault' : (idx === 2 ? 'idle' : 'running');
    const cycleTime = status === 'running' ? randomInRange(40, 50, idx) : 0;

    return {
      id,
      name: id.toUpperCase().replace('_', ' '),
      operator: operators[idx] || 'Auto',
      status,
      produced: status === 'running' ? Math.floor(randomInRange(400, 500, idx)) : Math.floor(randomInRange(100, 200, idx)),
      cycle_time: Number(cycleTime.toFixed(1)),
      efficiency: status === 'running' ? Math.floor(randomInRange(80, 95, idx)) : Math.floor(randomInRange(50, 75, idx))
    };
  });
};

/**
 * Generate SPC control chart data.
 * Date-range aware — generates points within [startDate, endDate].
 */
export const generateSPCControlPoints = (resolution = 'raw', startDate = null, endDate = null) => {
  const data = [];
  const target = 100;
  const ucl = 105;
  const lcl = 95;
  const cl = 100;
  const ucl_r = 3;
  const lcl_r = 0;

  const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
  const end = endDate ? new Date(endDate) : new Date();

  // Build label entries based on resolution and date range
  const entries = [];
  if (resolution === 'month') {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    let seed = 0;
    while (cursor <= endMonth) {
      entries.push({ label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`, seed });
      cursor.setMonth(cursor.getMonth() + 1);
      seed++;
    }
  } else if (resolution === 'day') {
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    let seed = 0;
    while (cursor <= end) {
      entries.push({
        label: `${cursor.getDate().toString().padStart(2, '0')}/${(cursor.getMonth() + 1).toString().padStart(2, '0')}`,
        seed
      });
      cursor.setDate(cursor.getDate() + 1);
      seed++;
    }
  } else if (resolution === 'shift') {
    const shiftNames = ['A', 'B', 'C'];
    const cursor = new Date(start); cursor.setHours(0, 0, 0, 0);
    let seed = 0;
    while (cursor <= end) {
      const dayStr = `${cursor.getDate().toString().padStart(2, '0')}/${(cursor.getMonth() + 1).toString().padStart(2, '0')}`;
      for (let s = 0; s < 3; s++) {
        entries.push({ label: `${dayStr} - ${shiftNames[s]}`, seed });
        seed++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (resolution === 'hour') {
    const cursor = new Date(start);
    let seed = 0;
    while (cursor <= end) {
      entries.push({ label: `${cursor.getHours().toString().padStart(2, '0')}:00`, seed });
      cursor.setTime(cursor.getTime() + 60 * 60 * 1000);
      seed++;
    }
  } else {
    // 'raw' — 30-min intervals
    const cursor = new Date(start);
    let seed = 0;
    while (cursor <= end) {
      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      entries.push({ label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, seed });
      cursor.setTime(cursor.getTime() + 30 * 60 * 1000);
      seed++;
    }
  }

  // For aggregated resolutions, tighten variation (averages are less noisy)
  const isAggregated = resolution !== 'raw';
  const variation = isAggregated ? 2 : 4;
  const outOfControlThreshold = isAggregated ? 0.97 : 0.9;

  for (const { label, seed } of entries) {
    const isOutOfControl = randomInRange(0, 1, seed) > outOfControlThreshold;
    let mean = target + randomInRange(-variation, variation, seed);
    if (isOutOfControl) {
      mean = randomInRange(0, 1, seed + 100) > 0.5 ? ucl + 2 : lcl - 2;
    }

    data.push({
      time_label: label,
      mean: Number(mean.toFixed(2)),
      range: Number(randomInRange(0.5, isAggregated ? 1.5 : 2.5, seed + 50).toFixed(2)),
      ucl,
      lcl,
      cl,
      ucl_r,
      lcl_r
    });
  }

  return data;
};

// Generate SPC metrics — date-range-aware via seed
export const generateSPCMetrics = (seed = 1) => {
  const cpVal = Number(randomInRange(1.33, 1.80, seed).toFixed(2));
  return {
    cp: {
      value: cpVal,
      status: cpVal >= 1.67 ? 'Excellent' : cpVal >= 1.33 ? 'Good' : 'Needs Improvement'
    },
    cpk: {
      value: Number(randomInRange(1.20, 1.65, seed + 10).toFixed(2))
    },
    pp: {
      value: Number(randomInRange(1.25, 1.70, seed + 20).toFixed(2))
    },
    ppk: {
      value: Number(randomInRange(1.15, 1.55, seed + 30).toFixed(2))
    }
  };
};

// Generate histogram data
export const generateHistogram = () => {
  return [
    { range: '94-96', count: Math.floor(randomInRange(3, 8, 1)) },
    { range: '96-98', count: Math.floor(randomInRange(10, 18, 2)) },
    { range: '98-100', count: Math.floor(randomInRange(35, 50, 3)) },
    { range: '100-102', count: Math.floor(randomInRange(25, 40, 4)) },
    { range: '102-104', count: Math.floor(randomInRange(8, 15, 5)) },
    { range: '104-106', count: Math.floor(randomInRange(2, 6, 6)) }
  ];
};

// Generate defects pie chart data
export const generateDefects = () => {
  return [
    { name: 'LVDT Fail', value: Math.floor(randomInRange(40, 60, 1)) },
    { name: 'Camera Fail', value: Math.floor(randomInRange(25, 40, 2)) },
    { name: 'Dimension Error', value: Math.floor(randomInRange(15, 30, 3)) },
    { name: 'Surface Defect', value: Math.floor(randomInRange(10, 20, 4)) }
  ];
};

// Generate SPC alerts
export const generateSPCAlerts = () => {
  const alerts = [];
  const hasAlert = randomInRange(0, 1, Date.now()) > 0.7;

  if (hasAlert) {
    alerts.push({
      message: 'Rule 1 Violation: Point beyond control limit',
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      station: 'OP-20'
    });
  }

  return alerts;
};

// Generate complete line status (Production + SPC)
export const generateLineStatus = (filters = {}) => {
  const resolution = filters.resolution || 'raw';
  const { start, end } = resolveDateBounds(filters.dateRange, filters.startDate, filters.endDate);
  // Derive a date-based seed for SPC metrics
  const spcSeed = hashString(`${filters.dateRange || 'today'}-${filters.startDate || 'x'}-${filters.endDate || 'x'}-spc`);

  return {
    line_kpi: generateLineKPI(filters),
    charts: {
      velocity: generateVelocityChart(resolution, start, end)
    },
    downtime: {
      top_reasons: generateDowntimeReasons()
    },
    stations: generateStations(filters.line || 'fcpv'),
    spc: {
      metrics: generateSPCMetrics(spcSeed),
      charts: {
        control_points: generateSPCControlPoints(resolution, start, end),
        histogram: generateHistogram(),
        defects: generateDefects()
      },
      alerts: generateSPCAlerts()
    },
    meta: {
      resolution,
      generated_at: new Date().toISOString()
    }
  };
};

// Generate station details for drill-down view
export const generateStationDetails = (stationId) => {
  const productionTrend = [];
  const now = new Date();

  // Generate 24 hours of production trend
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;

    productionTrend.push({
      time: timeStr,
      output: Math.floor(randomInRange(0, 500, i)),
      cycle_time: Number(randomInRange(40, 55, i + 100).toFixed(1))
    });
  }

  // Generate recent logs
  const logs = [];
  for (let i = 0; i < 50; i++) {
    const time = new Date(now.getTime() - i * 2 * 60 * 1000); // 2-min intervals
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

    logs.push({
      timestamp: timeStr,
      part_id: `PN-${10000 + i}`,
      value: Number(randomInRange(98, 102, i).toFixed(2)),
      status: randomInRange(0, 1, i) > 0.1 ? 'OK' : 'NOK',
      cycle_time: Number(randomInRange(40, 50, i + 200).toFixed(1))
    });
  }

  return {
    station_details: {
      production_trend: productionTrend,
      logs
    }
  };
};
