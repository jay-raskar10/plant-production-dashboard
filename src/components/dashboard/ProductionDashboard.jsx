import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATIONS as MOCK_STATIONS, KPI_DATA, STATION_STATUS } from '@/lib/data';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useFilters } from '@/context/FilterContext';

// Mock Line Graph Data (moving local for now or imported)
const LINE_GRAPH_DATA = [
    { time: '06:00', output: 120, target: 150 },
    { time: '07:00', output: 132, target: 150 },
    { time: '08:00', output: 101, target: 150 },
    { time: '09:00', output: 145, target: 150 },
    { time: '10:00', output: 160, target: 150 },
    { time: '11:00', output: 155, target: 150 },
    { time: '12:00', output: 140, target: 150 },
];

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

const LinePerformanceChart = () => {
    return (
        <Card className="col-span-4 lg:col-span-3 border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Production Velocity (Actual vs Target)
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={LINE_GRAPH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                "group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer overflow-hidden backdrop-blur-sm",
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
                        <span className="text-lg font-medium">{station.cycleTime}s</span>
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

    // Filter stations based on selected line (simple logic for now)
    const displayStations = filters.line === 'all'
        ? STATION_STATUS
        : STATION_STATUS; // In real app, filter here. Mock data STATION_STATUS is small.

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Production Overview</h2>
                <p className="text-muted-foreground">Real-time monitoring for <span className="font-semibold text-foreground">{filters.line}</span> at <span className="font-semibold text-foreground">{filters.plant}</span>.</p>
            </div>

            {/* KPI Ribbon */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Output"
                    value={KPI_DATA.production.value}
                    subtitle={`Target: ${KPI_DATA.production.target}`}
                    icon={Activity}
                    trend={true}
                />
                <KPICard
                    title="Line OEE"
                    value={`${KPI_DATA.oee.value}%`}
                    subtitle="Overall Efficiency"
                    icon={Zap}
                    trend={true}
                />
                <KPICard
                    title="Rejections"
                    value={KPI_DATA.rejection.value}
                    subtitle="Requires Attention"
                    icon={AlertTriangle}
                />
                <KPICard
                    title="Shift Efficiency"
                    value={`${KPI_DATA.efficiency.value}%`}
                    subtitle="First Pass Yield"
                    icon={CheckCircle2}
                    trend={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Line Chart */}
                <LinePerformanceChart />

                {/* Side Panel: Top Downtime / Quick Stats (Mock) */}
                <Card className="col-span-1 border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Top Downtime Reasons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {['Tool Change (OP-20)', 'Material Shortage (OP-10)', 'Sensor Fault (OP-50)'].map((reason, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{reason}</span>
                                    <span className="font-mono font-medium text-destructive">{15 - (i * 3)}m</span>
                                </div>
                            ))}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {displayStations.map((station) => (
                        <StationCard key={station.id} station={station} />
                    ))}
                </div>
            </div>
        </div>
    );
}
