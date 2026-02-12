import React, { useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, MoreHorizontal, ArrowUpRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { usePolling } from '@/hooks/usePolling';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                <div className="p-2 rounded-full bg-secondary/80">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                    {subtitle}
                    {trend && <span className="text-success flex items-center font-medium bg-success/10 px-1.5 py-0.5 rounded-full">+2.4% <ArrowUpRight className="h-3 w-3 ml-0.5" /></span>}
                </div>
            </div>
        </CardContent>
    </Card>
);


const LinePerformanceChart = ({ chartData = [] }) => {
    return (
        <Card className="col-span-4 lg:col-span-3 h-full border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Production Velocity (Actual vs Target)
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                {chartData.length === 0 ? (
                    <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                            <p className="text-sm">Loading chart data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] 2xl:h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'hsl(var(--card))'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="output"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOutput)"
                                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="hsl(var(--muted-foreground))"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    opacity={0.5}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


const StationCard = ({ station }) => {
    const navigate = useNavigate();

    const statusConfig = {
        running: { color: "bg-success", text: "text-success", border: "border-success/20", bg: "bg-success/5" },
        warning: { color: "bg-warning", text: "text-warning", border: "border-warning/20", bg: "bg-warning/5" },
        fault: { color: "bg-destructive", text: "text-destructive", border: "border-destructive/20", bg: "bg-destructive/5" },
        idle: { color: "bg-muted-foreground", text: "text-muted-foreground", border: "border-border", bg: "bg-secondary" },
    }[station.status] || { color: "bg-gray-500", text: "text-gray-500", border: "", bg: "" };

    return (
        <div
            onClick={() => navigate(`/station/${station.id}`)}
            className={cn(
                "group relative flex flex-col justify-between h-full rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer overflow-hidden backdrop-blur-sm",
                statusConfig.border
            )}
        >
            {/* Status Strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusConfig.color)} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-lg leading-none tracking-tight group-hover:text-primary transition-colors">{station.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Operator: {station.operator || 'Auto'}</p>
                </div>
                <div className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", statusConfig.bg, statusConfig.text)}>
                    {station.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Today's Output</span>
                    <div className="text-2xl font-mono font-bold tracking-tight">{station.produced || 0}</div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Cycle Time</span>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-lg font-medium">{station.cycle_time}s</span>
                    </div>
                </div>
            </div>

            {/* Efficiency Bar at bottom */}
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", statusConfig.color)} style={{ width: `${station.efficiency || 80}%` }} />
            </div>
        </div>
    );
};

export default function ProductionDashboard() {
    const { filters } = useFilters();

    // Store filters in a ref to avoid recreating fetch function on every filter change
    const filtersRef = useRef(filters);

    // Update ref when filters change (but don't trigger re-creation of fetch function)
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Memoize the fetch function - stable reference, reads latest filters from ref
    const fetchLineStatus = useCallback(() => {
        return apiService.getLineStatus(filtersRef.current);
    }, []); // Empty deps - function never recreates, always reads latest from ref

    // Fetch line status with polling - using configured interval
    const { data: lineStatus, error, loading } = usePolling(
        fetchLineStatus,
        API_CONFIG.POLLING_INTERVAL
    );

    // Extract data from API response - display actual production data without any modification
    const kpiData = lineStatus?.line_kpi || {};
    const chartData = lineStatus?.charts?.velocity || [];
    const downtimeData = lineStatus?.downtime?.top_reasons || [];
    const stationsData = lineStatus?.stations || [];



    // Show loading state only on first load
    if (loading && !lineStatus) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Production Overview</h2>
                    <p className="text-muted-foreground">Loading data...</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="h-20 animate-pulse bg-muted rounded" />
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Production Overview</h2>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <p>Failed to load data. Retrying...</p>
                    </div>
                </div>
            </div>

        );
    }

    return (
        <>
            <div className="space-y-8 pb-10">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight text-foreground">Production Overview</h2>
                    <p className="text-muted-foreground 2xl:text-lg">Real-time monitoring for <span className="font-semibold text-foreground">{filters.line}</span> at <span className="font-semibold text-foreground">{filters.plant}</span>.</p>
                </div>

                {/* KPI Ribbon */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-8">
                    <KPICard
                        title="Total Output"
                        value={kpiData.production?.current || 0}
                        subtitle={`Target: ${kpiData.production?.target || 0}`}
                        icon={Activity}
                        trend={true}
                    />
                    <KPICard
                        title="Line OEE"
                        value={`${kpiData.oee?.value || 0}%`}
                        subtitle="Overall Efficiency"
                        icon={Zap}
                        trend={true}
                    />
                    <KPICard
                        title="Rejections"
                        value={kpiData.rejection?.count || 0}
                        subtitle="Requires Attention"
                        icon={AlertTriangle}
                    />
                    <KPICard
                        title="Shift Efficiency"
                        value={`${kpiData.efficiency?.value || 0}%`}
                        subtitle="First Pass Yield"
                        icon={CheckCircle2}
                        trend={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* Main Line Chart */}
                    <div className="lg:col-span-3 xl:col-span-4 h-full">
                        <LinePerformanceChart chartData={chartData} />
                    </div>

                    {/* Side Panel: Top Downtime / Quick Stats */}
                    <Card className="col-span-1 h-full border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Top Downtime Reasons</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {downtimeData.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{item.reason} ({item.station})</span>
                                        <span className="font-mono font-medium text-destructive">{item.duration}m</span>
                                    </div>
                                ))}
                                {downtimeData.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No downtime recorded</p>
                                )}
                            </div>
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Shift Progress</div>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[70%]" />
                                </div>
                                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                    <span>06:00</span>
                                    <span>14:00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Station Grid */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        Station Status
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-8">
                        {stationsData.map((station) => (
                            <StationCard key={station.id} station={station} />
                        ))}
                    </div>
                    {stationsData.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No stations available</p>
                    )}
                </div>
            </div>
        </>
    );
}

