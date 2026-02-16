import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/context/FilterContext';
import { useDisplayMode } from '@/context/DisplayModeContext';
import { usePolling } from '@/hooks/usePolling';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';
import ControlChart from '@/components/charts/ControlChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, RefreshCw, AlertTriangle, Activity, Table as TableIcon, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Helper: get SPC index status label from value
function getSpcStatus(value) {
    if (!value && value !== 0) return { label: 'N/A', color: 'text-muted-foreground bg-muted' };
    if (value >= 1.67) return { label: 'Excellent', color: 'text-success bg-success/10' };
    if (value >= 1.33) return { label: 'Good', color: 'text-success bg-success/10' };
    if (value >= 1.00) return { label: 'Adequate', color: 'text-warning bg-warning/10' };
    return { label: 'Poor', color: 'text-destructive bg-destructive/10' };
}

// Helper: get left border color for SPC card
function getSpcBorderColor(value) {
    if (!value && value !== 0) return 'border-l-muted-foreground';
    if (value >= 1.33) return 'border-l-success';
    if (value >= 1.00) return 'border-l-warning';
    return 'border-l-destructive';
}

export default function SPCDashboard() {
    const { filters } = useFilters();
    const { chartFontSize, chartHeightSmall } = useDisplayMode();
    const [selectedParameter, setSelectedParameter] = useState('opening-pressure');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState('');

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

    // Export handler — wired to backend /api/export
    const handleExport = async () => {
        setExporting(true);
        setExportMessage('');
        try {
            const result = await apiService.exportReport(
                { plant: filters.plant, line: filters.line, station: filters.station, shift: filters.shift, dateRange: filters.dateRange },
                viewMode === 'graph' ? 'spc_graph' : 'spc_table'
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
    if (loading && !spcData) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">SPC Analysis</h2>
                    <p className="text-muted-foreground">Loading data...</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border border-border bg-card">
                            <CardContent className="p-5">
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

                {/* View Toggle + Parameter + Download */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Parameter Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Parameter:</label>
                        <Select
                            className="w-[200px] border-border bg-card"
                            value={selectedParameter}
                            onChange={(e) => setSelectedParameter(e.target.value)}
                        >
                            <option value="opening-pressure">Opening Pressure</option>
                            <option value="leak-rate">Leak Rate</option>
                            <option value="safety-pressure">Safety Pressure</option>
                        </Select>
                    </div>

                    <div className="h-6 w-px bg-border hidden md:block" />

                    {/* View Mode Toggle */}
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

            {/* === GRAPH VIEW === */}
            {viewMode === 'graph' && (
                <>
                    {/* Process Capability Metrics — with semantic borders and proper status labels */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { key: 'cp', label: 'Cp', desc: 'Process Capability', target: '> 1.33' },
                            { key: 'cpk', label: 'Cpk', desc: 'Capability Index', target: '> 1.33' },
                            { key: 'pp', label: 'Pp', desc: 'Process Performance', target: '> 1.33' },
                            { key: 'ppk', label: 'Ppk', desc: 'Performance Index', target: '> 1.00' },
                        ].map(({ key, label, desc, target }) => {
                            const val = metrics[key]?.value;
                            const status = getSpcStatus(val);
                            const borderColor = getSpcBorderColor(val);
                            return (
                                <Card key={key} className={cn("border border-border bg-card border-l-4", borderColor)}>
                                    <CardContent className="p-5">
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-4xl font-bold tracking-tight font-mono tabular-nums">{val || 0}</div>
                                                <p className="text-xs text-muted-foreground">{desc}</p>
                                            </div>
                                            <div className="pt-2 border-t border-border">
                                                <span className={cn('px-2 py-0.5 rounded text-xs font-bold', status.color)}>{status.label}</span>
                                                <p className="text-xs text-muted-foreground mt-1.5">Target: {target}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
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

                    {/* Histogram and Defect Breakdown Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Histogram - Distribution Analysis */}
                        <Card className="border border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Distribution Histogram (LVDT)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`${chartHeightSmall} w-full`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.histogram || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis
                                                dataKey="range"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={chartFontSize}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={chartFontSize}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Frequency', angle: -90, position: 'insideLeft', style: { fontSize: chartFontSize, fill: 'hsl(var(--muted-foreground))' } }}
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
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-4 text-xs font-semibold font-mono">
                                    <span className="text-muted-foreground">Mean: 100.2</span>
                                    <span className="text-muted-foreground">Std Dev: 2.1</span>
                                    <span className="text-muted-foreground">Cpk: 1.52</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Defect Breakdown — HORIZONTAL BAR CHART (replaced pie chart) */}
                        <Card className="border border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                    Defect Type Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`${chartHeightSmall} w-full`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={(charts.defects || []).map(d => ({ ...d, name: d.name || d.type }))}
                                            layout="vertical"
                                            margin={{ top: 10, right: 40, left: 80, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                            <XAxis
                                                type="number"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={chartFontSize}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={chartFontSize}
                                                tickLine={false}
                                                axisLine={false}
                                                width={80}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '4px',
                                                    border: '1px solid hsl(var(--border))',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                    backgroundColor: 'hsl(var(--card))',
                                                    fontSize: chartFontSize
                                                }}
                                                formatter={(value) => [`${value} defects`, 'Count']}
                                            />
                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 font-mono text-center">
                                    Total Defects: {(charts.defects || []).reduce((sum, d) => sum + (d.value || 0), 0)} parts (Last 24 hours)
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SPC Violations — Status badge style */}
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Recent SPC Violations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alerts.length > 0 ? (
                                <ul className="space-y-2">
                                    {alerts.map((alert, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded border border-destructive/20 bg-destructive/5">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                                <span className="text-sm font-medium text-destructive">{alert.message}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap ml-4">{alert.time} — {alert.station}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded border border-success/20 bg-success/5">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <span className="text-sm font-semibold text-success">No Violations — Process Stable</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* === TABLE VIEW === */}
            {viewMode === 'table' && (
                <>
                    {/* SPC Metrics Table */}
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <TableIcon className="h-4 w-4 text-primary" />
                                Process Capability Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800 text-white">
                                        <tr>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Metric</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">Value</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Status</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Target</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: 'Cp (Process Capability)', value: metrics.cp?.value, target: '> 1.33' },
                                            { label: 'Cpk (Capability Index)', value: metrics.cpk?.value, target: '> 1.33' },
                                            { label: 'Pp (Process Performance)', value: metrics.pp?.value, target: '> 1.33' },
                                            { label: 'Ppk (Performance Index)', value: metrics.ppk?.value, target: '> 1.00' },
                                        ].map((row, i) => {
                                            const status = getSpcStatus(row.value);
                                            return (
                                                <tr key={i} className={cn('border-b transition-colors hover:bg-muted/50', i % 2 === 1 && 'bg-muted/20')}>
                                                    <td className="p-4 font-medium">{row.label}</td>
                                                    <td className="p-4 text-right font-mono text-lg font-bold tabular-nums">{row.value || 0}</td>
                                                    <td className="p-4">
                                                        <span className={cn('px-2 py-0.5 rounded text-xs font-bold', status.color)}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground font-mono">{row.target}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Control Points Data Table */}
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <TableIcon className="h-4 w-4 text-primary" />
                                Control Chart Data Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800 text-white sticky top-0 z-10">
                                        <tr>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Sample #</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">Mean</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">Range</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">UCL</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">CL</th>
                                            <th className="h-11 px-4 text-right font-semibold text-sm">LCL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(charts.control_points || []).map((point, i) => {
                                            const outOfControl = point.mean > (point.ucl || 105) || point.mean < (point.lcl || 95);
                                            return (
                                                <tr key={i} className={cn(
                                                    'border-b transition-colors hover:bg-muted/50',
                                                    outOfControl && 'bg-destructive/5',
                                                    !outOfControl && i % 2 === 1 && 'bg-muted/20'
                                                )}>
                                                    <td className="p-4 font-medium">{point.sample || i + 1}</td>
                                                    <td className={cn('p-4 text-right font-mono tabular-nums', outOfControl && 'text-destructive font-bold')}>{point.mean?.toFixed(2) || '-'}</td>
                                                    <td className="p-4 text-right font-mono tabular-nums">{point.range?.toFixed(2) || '-'}</td>
                                                    <td className="p-4 text-right font-mono tabular-nums text-muted-foreground">{point.ucl?.toFixed(2) || '-'}</td>
                                                    <td className="p-4 text-right font-mono tabular-nums text-muted-foreground">{point.cl?.toFixed(2) || '-'}</td>
                                                    <td className="p-4 text-right font-mono tabular-nums text-muted-foreground">{point.lcl?.toFixed(2) || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                        {(charts.control_points || []).length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    No control point data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Violations Table */}
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">SPC Violations Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800 text-white">
                                        <tr>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Time</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Station</th>
                                            <th className="h-11 px-4 text-left font-semibold text-sm">Violation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alerts.map((alert, i) => (
                                            <tr key={i} className={cn('border-b transition-colors hover:bg-muted/50', i % 2 === 1 && 'bg-muted/20')}>
                                                <td className="p-4 whitespace-nowrap font-mono tabular-nums">{alert.time}</td>
                                                <td className="p-4 whitespace-nowrap font-medium">{alert.station}</td>
                                                <td className="p-4">
                                                    <span className="text-destructive font-medium">{alert.message}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {alerts.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                    No SPC violations detected
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
