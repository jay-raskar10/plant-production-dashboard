import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, MoreHorizontal, ArrowUpRight, RefreshCw, Download, Table as TableIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { useDisplayMode } from '@/context/DisplayModeContext';
import { usePolling } from '@/hooks/usePolling';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, status }) => {
    // Semantic left border based on status or default to primary
    const borderColor = {
        success: 'border-l-success',
        warning: 'border-l-warning',
        error: 'border-l-destructive',
    }[status] || 'border-l-primary';

    return (
        <Card className={cn("border border-border bg-card border-l-4", borderColor)}>
            <CardContent className="p-5">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                    <div className="text-4xl font-bold tracking-tight tabular-nums font-mono">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
};


const LinePerformanceChart = ({ chartData = [] }) => {
    const { chartFontSize, chartStrokeWidth, chartDotRadius, chartActiveDotRadius, chartHeight } = useDisplayMode();
    // Calculate average target for reference line
    const avgTarget = chartData.length > 0
        ? Math.round(chartData.reduce((sum, d) => sum + (d.target || 0), 0) / chartData.length)
        : 0;

    return (
        <Card className="col-span-4 lg:col-span-3 h-full border border-border bg-card">
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
                    <div className={`${chartHeight} w-full`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={chartFontSize}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={chartFontSize}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '4px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        backgroundColor: 'hsl(var(--card))',
                                        fontSize: chartFontSize
                                    }}
                                />
                                {/* Actual output — line only, no area fill */}
                                <Line
                                    type="monotone"
                                    dataKey="output"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={chartStrokeWidth}
                                    dot={{ r: chartDotRadius, fill: "hsl(var(--primary))", strokeWidth: 1, stroke: "hsl(var(--card))" }}
                                    activeDot={{ r: chartActiveDotRadius }}
                                />
                                {/* Target line — bold red dashed, prominent */}
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="hsl(var(--destructive))"
                                    strokeWidth={chartStrokeWidth}
                                    strokeDasharray="8 4"
                                    dot={false}
                                    opacity={0.8}
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
    const isFault = station.status === 'fault';

    const statusConfig = {
        running: { strip: "bg-success", text: "text-success", badge: "bg-success/10 text-success" },
        warning: { strip: "bg-warning", text: "text-warning", badge: "bg-warning/10 text-warning" },
        fault: { strip: "bg-destructive", text: "text-white", badge: "bg-white/20 text-white" },
        idle: { strip: "bg-muted-foreground", text: "text-muted-foreground", badge: "bg-muted text-muted-foreground" },
    }[station.status] || { strip: "bg-muted-foreground", text: "text-muted-foreground", badge: "bg-muted text-muted-foreground" };

    // Efficiency color coding
    const eff = station.efficiency || 0;
    const effColor = eff >= 90 ? 'bg-success' : eff >= 80 ? 'bg-warning' : 'bg-destructive';

    return (
        <div
            onClick={() => navigate(`/station/${station.id}`)}
            className={cn(
                "group relative flex flex-col justify-between h-full rounded-md border bg-card p-5 transition-all hover:border-primary/40 cursor-pointer overflow-hidden",
                isFault ? "bg-destructive text-white border-destructive" : "border-border"
            )}
        >
            {/* Status Strip — 6px wide */}
            {!isFault && <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", statusConfig.strip)} />}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={cn("font-semibold text-lg leading-none tracking-tight", isFault ? "text-white" : "group-hover:text-primary transition-colors")}>{station.name}</h3>
                    <p className={cn("text-xs mt-1", isFault ? "text-white/70" : "text-muted-foreground")}>Operator: {station.operator || 'Auto'}</p>
                </div>
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", statusConfig.badge)}>
                    {isFault && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                    {station.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="space-y-1">
                    <span className={cn("text-[10px] uppercase font-semibold", isFault ? "text-white/60" : "text-muted-foreground")}>Output</span>
                    <div className={cn("text-2xl font-mono font-bold tracking-tight tabular-nums", isFault && "text-white")}>{station.produced || 0}</div>
                </div>
                <div className="space-y-1">
                    <span className={cn("text-[10px] uppercase font-semibold", isFault ? "text-white/60" : "text-muted-foreground")}>Cycle Time</span>
                    <div className="flex items-center gap-1.5">
                        <Clock className={cn("h-3 w-3", isFault ? "text-white/60" : "text-muted-foreground")} />
                        <span className={cn("text-lg font-medium font-mono tabular-nums", isFault && "text-white")}>{station.cycle_time}s</span>
                    </div>
                </div>
            </div>

            {/* Efficiency gauge — color-coded */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className={cn("text-[10px] uppercase font-semibold", isFault ? "text-white/60" : "text-muted-foreground")}>Efficiency</span>
                    <span className={cn("text-xs font-mono font-bold tabular-nums", isFault ? "text-white" : eff >= 90 ? "text-success" : eff >= 80 ? "text-warning" : "text-destructive")}>{eff}%</span>
                </div>
                <div className={cn("w-full h-1.5 rounded-sm overflow-hidden", isFault ? "bg-white/20" : "bg-secondary")}>
                    <div className={cn("h-full rounded-sm transition-all", isFault ? "bg-white/60" : effColor)} style={{ width: `${eff}%` }} />
                </div>
            </div>
        </div>
    );
};

export default function ProductionDashboard() {
    const { filters } = useFilters();
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState('');

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

    // Export handler — wired to backend /api/export
    const handleExport = async () => {
        setExporting(true);
        setExportMessage('');
        try {
            const result = await apiService.exportReport(
                { plant: filters.plant, line: filters.line, station: filters.station, shift: filters.shift, dateRange: filters.dateRange },
                viewMode === 'graph' ? 'production_graph' : 'production_table'
            );
            if (!result.success) {
                setExportMessage(result.message);
                setTimeout(() => setExportMessage(''), 4000);
            }
        } catch (err) {
            setExportMessage('Export failed: ' + err.message);
            setTimeout(() => setExportMessage(''), 4000);
        } finally {
            setExporting(false);
        }
    };



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
                        <Card key={i} className="border border-border bg-card">
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col space-y-2">
                        <h2 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight text-foreground">Production Overview</h2>
                        <p className="text-muted-foreground 2xl:text-lg">Real-time monitoring for <span className="font-semibold text-foreground">{filters.line}</span> at <span className="font-semibold text-foreground">{filters.plant}</span>.</p>
                    </div>

                    {/* View Toggle + Download */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="bg-secondary p-1 rounded flex items-center">
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-all ${viewMode === 'graph' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Activity className="h-4 w-4 mr-2" /> Graph
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <TableIcon className="h-4 w-4 mr-2" /> Table
                            </button>
                        </div>

                        <Button onClick={handleExport} disabled={exporting} variant="outline" className="border-border hover:bg-muted">
                            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {exporting ? 'Exporting...' : 'Download'}
                        </Button>

                        {exportMessage && (
                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border animate-in fade-in duration-300">
                                {exportMessage}
                            </span>
                        )}
                    </div>
                </div>

                {/* KPI Ribbon — always visible */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-8">
                    <KPICard
                        title="Total Output"
                        value={kpiData.production?.current || 0}
                        subtitle={`Target: ${kpiData.production?.target || 0}`}
                        icon={Activity}
                        status={(kpiData.production?.current || 0) >= (kpiData.production?.target || 1) ? 'success' : 'warning'}
                    />
                    <KPICard
                        title="Line OEE"
                        value={`${kpiData.oee?.value || 0}%`}
                        subtitle="Overall Efficiency · Target: 85%"
                        icon={Zap}
                        status={(kpiData.oee?.value || 0) >= 85 ? 'success' : (kpiData.oee?.value || 0) >= 75 ? 'warning' : 'error'}
                    />
                    <KPICard
                        title="Rejections"
                        value={kpiData.rejection?.count || 0}
                        subtitle="Requires Attention"
                        icon={AlertTriangle}
                        status={(kpiData.rejection?.count || 0) > 10 ? 'error' : 'success'}
                    />
                    <KPICard
                        title="Shift Efficiency"
                        value={`${kpiData.efficiency?.value || 0}%`}
                        subtitle="First Pass Yield · Target: 92%"
                        icon={CheckCircle2}
                        status={(kpiData.efficiency?.value || 0) >= 92 ? 'success' : (kpiData.efficiency?.value || 0) >= 80 ? 'warning' : 'error'}
                    />
                </div>

                {/* === GRAPH VIEW === */}
                {viewMode === 'graph' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Main Line Chart */}
                            <div className="lg:col-span-3 xl:col-span-4 h-full">
                                <LinePerformanceChart chartData={chartData} />
                            </div>

                            {/* Side Panel: Top Downtime / Quick Stats */}
                            <Card className="col-span-1 h-full border border-border bg-card">
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
                                        <div className="w-full bg-secondary h-2 rounded-sm overflow-hidden">
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
                    </>
                )}

                {/* === TABLE VIEW === */}
                {viewMode === 'table' && (
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <TableIcon className="h-4 w-4 text-primary" />
                                Station Production Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800 text-white sticky top-0 z-10">
                                        <tr>
                                            <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Station</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Operator</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Status</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm whitespace-nowrap">Output</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm whitespace-nowrap">Cycle Time</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm whitespace-nowrap">Efficiency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stationsData.map((station) => {
                                            const statusStyles = {
                                                running: 'text-success bg-success/10',
                                                warning: 'text-warning bg-warning/10',
                                                fault: 'text-destructive bg-destructive/10',
                                                idle: 'text-muted-foreground bg-muted/50',
                                            };
                                            const style = statusStyles[station.status] || 'text-muted-foreground bg-muted/50';
                                            return (
                                                <tr key={station.id} className={cn(
                                                    'border-b transition-colors hover:bg-muted/50',
                                                    station.status === 'fault' && 'bg-destructive/5',
                                                    station.status !== 'fault' && stationsData.indexOf(station) % 2 === 1 && 'bg-muted/20'
                                                )}>
                                                    <td className="p-4 font-medium whitespace-nowrap">{station.name}</td>
                                                    <td className="p-4 whitespace-nowrap">{station.operator || 'Auto'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${style}`}>
                                                            {station.status === 'fault' && '⚠ '}{station.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-mono tabular-nums">{station.produced || 0}</td>
                                                    <td className="p-4 text-right font-mono tabular-nums">{station.cycle_time}s</td>
                                                    <td className={cn('p-4 text-right font-mono tabular-nums font-semibold', (station.efficiency || 0) >= 90 ? 'text-success' : (station.efficiency || 0) >= 80 ? 'text-warning' : 'text-destructive')}>{station.efficiency || 0}%</td>
                                                </tr>
                                            );
                                        })}
                                        {stationsData.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    No station data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

