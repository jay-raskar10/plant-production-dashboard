import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar, Activity, Table as TableIcon, LineChart as ChartIcon, AlertTriangle, RefreshCw, Loader2, Gauge, Clock, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { useDisplayMode } from '@/context/DisplayModeContext';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';
import { usePolling } from '@/hooks/usePolling';
import ControlChart from '@/components/charts/ControlChart';
import { cn } from "@/lib/utils";

export default function StationAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { filters } = useFilters();
    const { chartFontSize, chartStrokeWidth, chartDotRadius, chartActiveDotRadius, chartHeight } = useDisplayMode();
    const [viewMode, setViewMode] = useState('graph'); // 'graph', 'table', 'spc' — LOCAL state
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState('');

    // Fetch station details with polling
    const fetchStationDetails = React.useCallback(() => {
        return apiService.getStationDetails(id, {
            dateRange: filters.dateRange,
            shift: filters.shift
        });
    }, [id, filters.dateRange, filters.shift]);

    const { data: stationData, error, loading } = usePolling(
        fetchStationDetails,
        API_CONFIG.POLLING_INTERVAL
    );

    // Also fetch SPC data specifically for this station
    const fetchStationSPC = React.useCallback(() => {
        return apiService.getSPCData({
            ...filters,
            station: id
        });
    }, [id, filters]);

    const { data: stationSPCData } = usePolling(
        fetchStationSPC,
        API_CONFIG.POLLING_INTERVAL
    );

    // Export handler — now wired to the real backend route
    const handleExport = async () => {
        setExporting(true);
        setExportMessage('');
        try {
            const result = await apiService.exportReport(
                { plant: filters.plant, line: filters.line, station: id, shift: filters.shift, dateRange: filters.dateRange },
                viewMode
            );
            if (!result.success) {
                setExportMessage(result.message);
                setTimeout(() => setExportMessage(''), 4000);
            }
        } catch (error) {
            setExportMessage('Export failed: ' + error.message);
            setTimeout(() => setExportMessage(''), 4000);
        } finally {
            setExporting(false);
        }
    };

    // Show loading state
    if (loading && !stationData) {
        return (
            <div className="h-[500px] w-full flex flex-col items-center justify-center text-muted-foreground">
                <RefreshCw className="h-10 w-10 animate-spin mb-4" />
                <p>Loading station analytics...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="h-[500px] w-full flex flex-col items-center justify-center text-destructive">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <p>Failed to load station data. Retrying...</p>
            </div>
        );
    }

    // Extract data with fallback for both flat and nested structures
    const activeData = stationData?.station_details || stationData?.data || stationData || {};
    const { charts = {}, logs = [] } = activeData;

    // Support both nested and direct trend/log mapping
    const graphData = activeData.production_trend || charts.production_trend || [];
    const tableLogs = activeData.logs || logs || [];

    // Get SPC data from the dedicated SPC fetch
    const spcContent = stationSPCData?.spc || stationSPCData || {};
    const spcPoints = spcContent.charts?.control_points || spcContent.control_points || [];
    const spcLimits = spcContent.charts?.control_points?.[0] || spcContent.control_points?.[0] || {};

    // Compute station-level KPIs from available data
    const totalOutput = graphData.length > 0 ? graphData[graphData.length - 1]?.output || 0 : 0;
    const okCount = tableLogs.filter(l => l.status === 'OK').length;
    const totalLogs = tableLogs.length;
    const yieldRate = totalLogs > 0 ? ((okCount / totalLogs) * 100).toFixed(1) : '—';
    const avgCycleTime = totalLogs > 0
        ? (tableLogs.reduce((sum, l) => sum + (parseFloat(l.cycle_time) || 0), 0) / totalLogs).toFixed(1)
        : '—';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight">Station: {id}</h2>
                        <p className="text-muted-foreground 2xl:text-lg">Detailed analytics for <span className="font-semibold">{filters.plant}</span> / <span className="font-semibold">{filters.line}</span>.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange} | {filters.shift}
                    </div>

                    {/* Local View Mode Toggle */}
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
                        <button
                            onClick={() => setViewMode('spc')}
                            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-all ${viewMode === 'spc' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <ChartIcon className="h-4 w-4 mr-2" /> SPC
                        </button>
                    </div>

                    {/* Export Button */}
                    <Button onClick={handleExport} disabled={exporting} variant="outline" className="border-border hover:bg-muted">
                        {exporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </Button>

                    {/* Export Status */}
                    {exportMessage && (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border animate-in fade-in duration-300">
                            {exportMessage}
                        </span>
                    )}
                </div>
            </div>

            {/* Station KPI Strip */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className={cn("border-l-4", totalOutput > 0 ? 'border-l-success' : 'border-l-muted-foreground')}>
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Output</p>
                        <div className="text-4xl font-bold font-mono tabular-nums mt-1">{totalOutput}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cumulative today</p>
                    </CardContent>
                </Card>
                <Card className={cn("border-l-4", parseFloat(yieldRate) >= 95 ? 'border-l-success' : parseFloat(yieldRate) >= 85 ? 'border-l-warning' : 'border-l-destructive')}>
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Pass Yield</p>
                        <div className="text-4xl font-bold font-mono tabular-nums mt-1">{yieldRate}%</div>
                        <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            <span className="text-xs text-muted-foreground">{okCount}/{totalLogs} passed</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Cycle Time</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-bold font-mono tabular-nums">{avgCycleTime}</span>
                            <span className="text-sm text-muted-foreground">sec</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">across {totalLogs} parts</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-warning">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rejections</p>
                        <div className="text-4xl font-bold font-mono tabular-nums mt-1">{totalLogs - okCount}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            <span className="text-xs text-muted-foreground">{totalLogs > 0 ? ((totalLogs - okCount) / totalLogs * 100).toFixed(1) : 0}% reject rate</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content */}
            <Card className="h-full min-h-[500px] border border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        {viewMode === 'graph' && <><Activity className="h-5 w-5 text-primary" /> Production Trend</>}
                        {viewMode === 'table' && <><TableIcon className="h-5 w-5 text-primary" /> Production Logs</>}
                        {viewMode === 'spc' && <><ChartIcon className="h-5 w-5 text-primary" /> SPC Control Charts</>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {viewMode === 'graph' && (
                        <div className={`${chartHeight} w-full mt-4`}>
                            {graphData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={chartFontSize} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={chartFontSize} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '4px',
                                                border: '1px solid hsl(var(--border))',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                backgroundColor: 'hsl(var(--card))',
                                                fontSize: chartFontSize
                                            }}
                                        />
                                        <Line
                                            type="linear"
                                            dataKey="output"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={chartStrokeWidth}
                                            dot={{ r: chartDotRadius, fill: "hsl(var(--primary))" }}
                                            activeDot={{ r: chartActiveDotRadius }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    No trend data available for this station.
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div className="border rounded mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800 text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Timestamp</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Plant</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Line</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Station</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Shift</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Part ID</th>
                                        <th className="h-11 px-4 text-right font-semibold text-sm whitespace-nowrap">Value</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Status</th>
                                        <th className="h-11 px-4 text-right font-semibold text-sm whitespace-nowrap">Cycle Time</th>
                                        <th className="h-11 px-4 text-left font-semibold text-sm whitespace-nowrap">Operator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableLogs.map((log, i) => (
                                        <tr key={log.id || i} className={cn(
                                            'border-b transition-colors hover:bg-muted/50',
                                            log.status !== 'OK' && 'bg-destructive/5',
                                            log.status === 'OK' && i % 2 === 1 && 'bg-muted/20'
                                        )}>
                                            <td className="p-4 whitespace-nowrap font-mono tabular-nums text-xs">{log.timestamp}</td>
                                            <td className="p-4 whitespace-nowrap">{log.plant || filters.plant}</td>
                                            <td className="p-4 whitespace-nowrap">{log.line || filters.line}</td>
                                            <td className="p-4 whitespace-nowrap font-medium">{log.station || id}</td>
                                            <td className="p-4 whitespace-nowrap">{log.shift || filters.shift}</td>
                                            <td className="p-4 whitespace-nowrap font-mono text-xs">{log.part_id}</td>
                                            <td className="p-4 text-right font-mono tabular-nums">{log.value}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "font-bold px-2 py-0.5 rounded text-xs uppercase",
                                                    log.status === 'OK' ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                                                )}>
                                                    {log.status !== 'OK' && '⚠ '}{log.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap font-mono tabular-nums">{log.cycle_time}s</td>
                                            <td className="p-4 whitespace-nowrap">{log.operator}</td>
                                        </tr>
                                    ))}
                                    {tableLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="10" className="p-8 text-center text-muted-foreground">
                                                No production logs found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === 'spc' && (
                        <div className="mt-4 grid gap-8">
                            <ControlChart
                                title="Station X-Bar Chart"
                                data={spcPoints}
                                dataKey="mean"
                                ucl={spcLimits.ucl || 105}
                                lcl={spcLimits.lcl || 95}
                                cl={spcLimits.cl || 100}
                            />
                            <ControlChart
                                title="Station R-Chart"
                                data={spcPoints}
                                dataKey="range"
                                ucl={spcLimits.ucl_r || 3}
                                lcl={spcLimits.lcl_r || 0}
                                cl={spcLimits.cl_r || 1.5}
                                color="hsl(var(--destructive))"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
