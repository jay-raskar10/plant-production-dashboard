import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar, Activity, Table as TableIcon, LineChart as ChartIcon, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFilters } from '@/context/FilterContext';
import { apiService } from '@/services/apiService';
import { API_CONFIG } from '@/config/config';
import { usePolling } from '@/hooks/usePolling';
import ControlChart from '@/components/charts/ControlChart';
import { cn } from "@/lib/utils";

const MOCK_GRAPH_DATA = [
    { time: '06:00', output: 0 },
    { time: '08:00', output: 120 },
    { time: '10:00', output: 250 },
    { time: '12:00', output: 380 },
    { time: '14:00', output: 450 },
    { time: '16:00', output: 600 },
    { time: '18:00', output: 780 },
];

export default function StationAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { filters } = useFilters();
    const [viewMode, setViewMode] = useState('graph'); // 'graph', 'table', 'spc'

    // Fetch station details with polling
    const fetchStationDetails = React.useCallback(() => {
        return apiService.getStationDetails(id, filters);
    }, [id, filters]);

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

    const handleExport = () => {
        alert("Exporting report for " + id + "...");
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
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange} | {filters.shift}
                    </div>

                    <div className="bg-secondary p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Activity className="h-4 w-4 mr-2" /> Graph
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <TableIcon className="h-4 w-4 mr-2" /> Table
                        </button>
                        <button
                            onClick={() => setViewMode('spc')}
                            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'spc' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <ChartIcon className="h-4 w-4 mr-2" /> SPC
                        </button>
                    </div>

                    <Button onClick={handleExport} variant="outline" className="border-primary/20 hover:bg-primary/5">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Content */}
            <Card className="h-full min-h-[500px] border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {viewMode === 'graph' && <><Activity className="h-5 w-5 text-primary" /> Production Trend</>}
                        {viewMode === 'table' && <><TableIcon className="h-5 w-5 text-primary" /> Production Logs</>}
                        {viewMode === 'spc' && <><ChartIcon className="h-5 w-5 text-primary" /> SPC Control Charts</>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {viewMode === 'graph' && (
                        <div className="h-[400px] w-full mt-4">
                            {graphData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={graphData}>
                                        <defs>
                                            <linearGradient id="colorOutput2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }}
                                        />
                                        <Area type="monotone" dataKey="output" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput2)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    No trend data available for this station.
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div className="border rounded-md mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Timestamp</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Plant</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Line</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Station</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Shift</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Part ID</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground whitespace-nowrap">Value</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Status</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground whitespace-nowrap">Cycle Time</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">Operator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableLogs.map((log, i) => (
                                        <tr key={log.id || i} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 whitespace-nowrap">{log.timestamp}</td>
                                            <td className="p-4 whitespace-nowrap">{log.plant || filters.plant}</td>
                                            <td className="p-4 whitespace-nowrap">{log.line || filters.line}</td>
                                            <td className="p-4 whitespace-nowrap">{log.station || id}</td>
                                            <td className="p-4 whitespace-nowrap">{log.shift || filters.shift}</td>
                                            <td className="p-4 whitespace-nowrap">{log.part_id}</td>
                                            <td className="p-4 text-right font-mono">{log.value}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "font-medium px-2 py-0.5 rounded-full text-xs",
                                                    log.status === 'OK' ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                                                )}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">{log.cycle_time}s</td>
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
