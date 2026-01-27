import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPC_DATA } from '@/lib/data';
import { useFilters } from '@/context/FilterContext';
import ControlChart from '@/components/charts/ControlChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, PieChartIcon } from 'lucide-react';

// Mock data for histogram (distribution of measurements)
const HISTOGRAM_DATA = [
    { range: '94-96', frequency: 2 },
    { range: '96-98', frequency: 8 },
    { range: '98-100', frequency: 25 },
    { range: '100-102', frequency: 35 },
    { range: '102-104', frequency: 22 },
    { range: '104-106', frequency: 6 },
    { range: '106-108', frequency: 2 },
];

// Mock data for defect breakdown pie chart
const DEFECT_DATA = [
    { name: 'LVDT Fail', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'Camera Fail', value: 30, color: 'hsl(var(--chart-2))' },
    { name: 'Spring Fail', value: 15, color: 'hsl(var(--chart-3))' },
    { name: 'Torque Fail', value: 10, color: 'hsl(var(--chart-4))' },
];

export default function SPCDashboard() {
    const { filters } = useFilters();

    // In a real app, SPC_DATA would be filtered by filters.station
    const currentStation = filters.station === 'all' ? 'All Stations' : filters.station;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">SPC Analysis</h2>
                <p className="text-muted-foreground">Process stability monitoring for <span className="font-semibold text-foreground">{currentStation}</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* X-Bar Chart */}
                <ControlChart
                    title="X-Bar Chart (Mean)"
                    data={SPC_DATA}
                    dataKey="mean"
                    ucl={105}
                    lcl={95}
                    cl={100}
                />

                {/* R Chart */}
                <ControlChart
                    title="R-Chart (Range)"
                    data={SPC_DATA}
                    dataKey="range"
                    ucl={3}
                    lcl={0}
                    cl={1.5}
                    color="hsl(var(--chart-2))"
                />
            </div>

            {/* Histogram and Pie Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Histogram - Distribution Analysis */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Distribution Histogram (LVDT)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HISTOGRAM_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="range"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Frequency', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            backgroundColor: 'hsl(var(--card))'
                                        }}
                                    />
                                    <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span>Mean: 100.2</span>
                            <span>Std Dev: 2.1</span>
                            <span>Cpk: 1.52</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart - Defect Breakdown */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-primary" />
                            Defect Type Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={DEFECT_DATA}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="hsl(var(--primary))"
                                        dataKey="value"
                                    >
                                        {DEFECT_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            backgroundColor: 'hsl(var(--card))'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-muted-foreground mt-2">
                            Total Defects: 100 parts (Last 24 hours)
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SPC Alerts / Violations List */}
            <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent SPC Violations</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between p-3 rounded-md bg-destructive/10 border border-destructive/20">
                            <span className="text-sm font-medium text-destructive-foreground">Rule 1 Violation: Point beyond UCL</span>
                            <span className="text-xs text-muted-foreground">10:45 AM - OP-20</span>
                        </li>
                        <li className="flex items-center justify-between p-3 rounded-md bg-warning/10 border border-warning/20">
                            <span className="text-sm font-medium text-warning-foreground">Rule 4: 8 consecutive points on one side of CL</span>
                            <span className="text-xs text-muted-foreground">09:30 AM - OP-10</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
