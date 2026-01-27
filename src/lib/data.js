export const PLANTS = [
    { id: 'pune', name: 'Pune' },
    { id: 'chennai', name: 'Chennai' }
];

export const LINES = [
    { id: 'fcpv', name: 'FCPV', plantId: 'pune' },
    { id: 'lacv', name: 'LACV', plantId: 'pune' },
    { id: 'compressor', name: 'Compressor', plantId: 'chennai' }
];

export const STATIONS = [
    { id: 'op-10', name: 'OP-10', lineId: 'fcpv' },
    { id: 'op-20', name: 'OP-20', lineId: 'fcpv' },
    { id: 'op-30', name: 'OP-30', lineId: 'fcpv' },
    { id: 'op-10-lacv', name: 'OP-10', lineId: 'lacv' }
];

export const SHIFTS = [
    { id: 'all', name: 'All Shifts' },
    { id: 'A', name: 'Shift A (06:00–14:00)' },
    { id: 'B', name: 'Shift B (14:00–22:00)' },
    { id: 'C', name: 'Shift C (22:00–06:00)' }
];

export const DATERANGES = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'last7', name: 'Last 7 Days' },
    { id: 'last30', name: 'Last 30 Days' },
    { id: 'custom', name: 'Custom' }
];

// Mock KPI Data
export const KPI_DATA = {
    production: { value: 1250, target: 1400, unit: 'units' },
    oee: { value: 85.5, target: 90, unit: '%' },
    rejection: { value: 12, target: 0, unit: 'units' },
    downtime: { value: 45, target: 30, unit: 'min' },
    efficiency: { value: 92, target: 95, unit: '%' }
};

// Mock SPC Data
export const SPC_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - (20 - i) * 1000 * 60 * 30).toLocaleTimeString(), // Every 30 mins
    mean: 100 + Math.random() * 5 - 2.5, // Target 100 +/- 2.5
    range: Math.random() * 2,
    ucl: 105,
    lcl: 95,
    cl: 100,
    ucl_r: 3,
    lcl_r: 0,
    defectRate: Math.random() * 0.05 // 0-5%
}));

export const STATION_STATUS = [
    { id: 'op-10', name: 'OP-10', status: 'running', produced: 450, cycleTime: 45 },
    { id: 'op-20', name: 'OP-20', status: 'fault', produced: 430, cycleTime: 0 },
    { id: 'op-30', name: 'OP-30', status: 'idle', produced: 120, cycleTime: 0 },
    { id: 'op-40', name: 'OP-40', status: 'running', produced: 410, cycleTime: 48 },
];
