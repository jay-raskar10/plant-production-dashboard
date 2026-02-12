import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/context/FilterContext';
import { usePolling } from '@/hooks/usePolling';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';
import ControlChart from '@/components/charts/ControlChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, PieChartIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { Select } from '@/components/ui/select';

export default function SPCDashboard() {
    const { filters } = useFilters();
    const [selectedParameter, setSelectedParameter] = useState('opening-pressure');

    // Store filters in a ref to avoid recreating fetch function on every filter change
    const filtersRef = useRef(filters);

    // Update ref when filters change
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Memoize the fetch function - stable reference, reads latest filters from ref
    const fetchSPCData = useCallback(() => {
        return apiService.getSPCData({
            ...filtersRef.current,
            parameter: selectedParameter
        });
    }, [selectedParameter]); // Only recreate when selectedParameter changes

    // Fetch SPC data with polling
    const { data: spcData, error, loading } = usePolling(
        fetchSPCData,
        API_CONFIG.POLLING_INTERVAL
    );

    // Extract SPC data from the nested 'spc' object returned by the API
    const spcContent = spcData?.spc || {};
    const metrics = spcContent.metrics || {};
    const charts = spcContent.charts || {};
    const alerts = spcContent.alerts || [];

    const currentStation = filters.station === 'all' ? 'All Stations' : filters.station;

    // Show loading state only on first load
    if (loading && !spcData) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">SPC Analysis</h2>
                    <p className="text-muted-foreground">Loading data...</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="h-32 animate-pulse bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">SPC Analysis</h2>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <p>Failed to load SPC data. Retrying...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight text-foreground">SPC Analysis</h2>
                    <p className="text-muted-foreground 2xl:text-lg">Process stability monitoring for <span className="font-semibold text-foreground">{currentStation}</span>.</p>
                </div>

                {/* Parameter Selector */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Parameter:</label>
                    <Select
                        className="w-[200px] bg-card/50 backdrop-blur-sm border-border/60"
                        value={selectedParameter}
                        onChange={(e) => setSelectedParameter(e.target.value)}
                    >
                        <option value="opening-pressure">Opening Pressure</option>
                        <option value="leak-rate">Leak Rate</option>
                        <option value="safety-pressure">Safety Pressure</option>
                    </Select>
                </div>
            </div>

            {/* Process Capability Metrics Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Cp Card */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-medium text-muted-foreground uppercase tracking-wider">Cp</p>
                                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-bold tracking-tight">{metrics.cp?.value || 0}</div>
                                <p className="text-sm text-muted-foreground">Process Capability</p>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <p className="text-sm text-success font-medium">{metrics.cp?.status || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground mt-1">Target: &gt; 1.33</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cpk Card */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-medium text-muted-foreground uppercase tracking-wider">Cpk</p>
                                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-bold tracking-tight">{metrics.cpk?.value || 0}</div>
                                <p className="text-sm text-muted-foreground">Process Capability Index</p>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <p className="text-sm text-success font-medium">{metrics.cpk?.status || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground mt-1">Min acceptable: 1.00</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pp Card */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-medium text-muted-foreground uppercase tracking-wider">Pp</p>
                                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-bold tracking-tight">{metrics.pp?.value || 0}</div>
                                <p className="text-sm text-muted-foreground">Process Performance</p>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <p className="text-sm text-success font-medium">{metrics.pp?.status || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground mt-1">Overall variation</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ppk Card */}
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-medium text-muted-foreground uppercase tracking-wider">Ppk</p>
                                <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-bold tracking-tight">{metrics.ppk?.value || 0}</div>
                                <p className="text-sm text-muted-foreground">Performance Index</p>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <p className="text-sm text-warning font-medium">{metrics.ppk?.status || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground mt-1">Slightly below target</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* X-Bar Chart */}
                <ControlChart
                    title="X-Bar Chart (Mean)"
                    data={charts.control_points || []}
                    dataKey="mean"
                    ucl={charts.control_points?.[0]?.ucl || 105}
                    lcl={charts.control_points?.[0]?.lcl || 95}
                    cl={charts.control_points?.[0]?.cl || 100}
                />

                {/* R Chart */}
                <ControlChart
                    title="R-Chart (Range)"
                    data={charts.control_points || []}
                    dataKey="range"
                    ucl={charts.control_points?.[0]?.ucl_r || 3}
                    lcl={charts.control_points?.[0]?.lcl_r || 0}
                    cl={(charts.control_points?.[0]?.ucl_r || 3) / 2}
                />
            </div>

            {/* Histogram and Pie Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-4 gap-6">
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
                                <BarChart data={charts.histogram || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                                        data={charts.defects || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="hsl(var(--primary))"
                                        dataKey="value"
                                    >
                                        {(charts.defects || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} />
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
                        {alerts.length > 0 ? (
                            alerts.map((alert, index) => (
                                <li key={index} className="flex items-center justify-between p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                    <span className="text-sm font-medium text-destructive">{alert.message}</span>
                                    <span className="text-xs text-muted-foreground">{alert.time} - {alert.station}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No SPC violations detected</p>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
