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

// Generate KPI data with realistic values
export const generateLineKPI = (filters = {}) => {
  const seed = Date.now() / 10000; // Changes slowly over time

  const targetProduction = 1400;
  const currentProduction = Math.floor(randomInRange(1100, 1450, seed));

  return {
    production: {
      current: currentProduction,
      target: targetProduction,
      trend: Number(generateTrend(seed).toFixed(1))
    },
    oee: {
      value: Number(randomInRange(75, 92, seed + 1).toFixed(1)),
      trend: Number(generateTrend(seed + 1).toFixed(1))
    },
    rejection: {
      count: Math.floor(randomInRange(8, 25, seed + 2))
    },
    efficiency: {
      value: Number(randomInRange(85, 96, seed + 3).toFixed(1))
    }
  };
};

// Generate time-series data for velocity chart
export const generateVelocityChart = (hoursInput = 12) => {
  const data = [];
  const now = new Date();
  const targetPerHour = 120;

  let count = hoursInput;
  let intervalMin = 60; // default 1 hour

  const size = process.env.MOCK_DATA_SIZE || 'normal';
  if (size === 'medium') {
    count = 100;
    intervalMin = 1;
  }
  else if (size === 'large') {
    count = 1000;
    intervalMin = 5;
  } else if (size === 'xl') {
    count = 10000;
    intervalMin = 1;
  }

  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMin * 60 * 1000);
    const hour = time.getHours();
    const minute = time.getMinutes();
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    data.push({
      time: timeStr,
      output: Math.floor(randomInRange(90, 150, i)),
      target: targetPerHour
    });
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

// Generate SPC control chart data
export const generateSPCControlPoints = (limitOverride = null) => {
  const data = [];
  const now = new Date();
  const target = 100;
  const ucl = 105;
  const lcl = 95;
  const cl = 100;
  const ucl_r = 3;
  const lcl_r = 0;

  // Determine data size based on env var or override
  let count = 20; // Default 'normal'
  const size = process.env.MOCK_DATA_SIZE || 'normal';

  if (limitOverride) {
    count = limitOverride;
  } else if (size === 'large') {
    count = 10000;
  } else if (size === 'xl') {
    count = 100000;
  } else if (size === 'normal') {
    count = 20;
  }

  // Adjust time interval based on count to keep data within reasonable recent timeframe
  // For large datasets, we might need smaller intervals or span longer time
  // Let's keep it simple: 10k points * 1 min = ~7 days. 100k points * 1 min = ~70 days.
  const intervalMinutes = count > 1000 ? 1 : 30;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    const hour = time.getHours();
    const minute = time.getMinutes();
    // For large datasets, include date in label if needed, but for now keeping HH:MM
    // To distinguish days in large datasets, might need full date, but UI might not handle it well yet.
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Occasionally generate out-of-control points
    const isOutOfControl = randomInRange(0, 1, i) > 0.99; // Lower probability for large datasets to avoid too many alerts?
    let mean = target + randomInRange(-4, 4, i);
    if (isOutOfControl) {
      mean = randomInRange(0, 1, i + 100) > 0.5 ? ucl + 2 : lcl - 2;
    }

    data.push({
      time: timeStr,
      mean: Number(mean.toFixed(2)),
      range: Number(randomInRange(0.5, 2.5, i + 50).toFixed(2)),
      ucl,
      lcl,
      cl,
      ucl_r,
      lcl_r
    });
  }

  return data;
};

// Generate SPC metrics
export const generateSPCMetrics = () => {
  return {
    cp: {
      value: Number(randomInRange(1.33, 1.80, 1).toFixed(2)),
      status: 'Excellent'
    },
    cpk: {
      value: Number(randomInRange(1.20, 1.65, 2).toFixed(2))
    },
    pp: {
      value: Number(randomInRange(1.25, 1.70, 3).toFixed(2))
    },
    ppk: {
      value: Number(randomInRange(1.15, 1.55, 4).toFixed(2))
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
  return {
    line_kpi: generateLineKPI(filters),
    charts: {
      velocity: generateVelocityChart(12)
    },
    downtime: {
      top_reasons: generateDowntimeReasons()
    },
    stations: generateStations(filters.line || 'fcpv'),
    spc: {
      metrics: generateSPCMetrics(),
      charts: {
        control_points: generateSPCControlPoints(), // No arg means use env var logic
        histogram: generateHistogram(),
        defects: generateDefects()
      },
      alerts: generateSPCAlerts()
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
