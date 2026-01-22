export const KPI_DATA = {
    output: 1250,
    target: 1400,
    oee: 87,
    alerts: 2,
};

export const LINE_GRAPH_DATA = [
    { time: '06:00', output: 120, target: 150 },
    { time: '08:00', output: 350, target: 400 },
    { time: '10:00', output: 680, target: 700 },
    { time: '12:00', output: 920, target: 1000 },
    { time: '14:00', output: 1250, target: 1400 },
    { time: '16:00', output: null, target: 1800 }, // Future
    { time: '18:00', output: null, target: 2200 }, // Future
];

export const STATIONS = [
    { id: 'op-10', name: 'OP-10 Turning', status: 'running', count: 450, cycleTime: '42s', operator: 'John D.', efficiency: 98 },
    { id: 'op-20', name: 'OP-20 Milling', status: 'running', count: 448, cycleTime: '45s', operator: 'Sarah K.', efficiency: 96 },
    { id: 'op-30', name: 'OP-30 Drilling', status: 'warning', count: 442, cycleTime: '52s', operator: 'Mike R.', efficiency: 85 },
    { id: 'op-40', name: 'OP-40 Boring', status: 'running', count: 445, cycleTime: '48s', operator: 'Lisa P.', efficiency: 97 },
    { id: 'op-50', name: 'OP-50 Grinding', status: 'fault', count: 320, cycleTime: '0s', operator: 'Tom B.', efficiency: 65 },
    { id: 'op-60', name: 'OP-60 Inspection', status: 'idle', count: 440, cycleTime: '0s', operator: 'System', efficiency: 99 },
    { id: 'op-70', name: 'OP-70 Packing', status: 'running', count: 438, cycleTime: '30s', operator: 'Team A', efficiency: 95 },
    { id: 'op-80', name: 'OP-80 Dispatch', status: 'running', count: 435, cycleTime: '55s', operator: 'Team B', efficiency: 94 },
];
