import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_GRAPH_DATA = [
    { time: '06:00', output: 0 },
    { time: '08:00', output: 120 },
    { time: '10:00', output: 250 },
    { time: '12:00', output: 380 },
    { time: '14:00', output: 450 },
    { time: '16:00', output: 600 },
    { time: '18:00', output: 780 },
];

export default function StationAnalytics({ filters }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('graph');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Station: {id}</h2>
                        <p className="text-muted-foreground">Detailed analytics for {filters.plant} / {filters.line}.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden sm:flex"><Calendar className="mr-2 h-4 w-4" /> {filters.dateRange}</Button>
                    <div className="bg-secondary rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Graph
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Table
                        </button>
                    </div>
                    <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
                </div>
            </div>

            {/* Content */}
            <Card className="h-full min-h-[500px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        {viewMode === 'graph' ? 'Production Trend' : 'Production Records'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {viewMode === 'graph' ? (
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_GRAPH_DATA}>
                                    <defs>
                                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="time" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="output" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="border rounded-md mt-4">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Timestamp</th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Cycle Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">10:30:45</td>
                                        <td className="p-4"><span className="text-success font-medium">OK</span></td>
                                        <td className="p-4 text-right">45.2s</td>
                                    </tr>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">10:31:30</td>
                                        <td className="p-4"><span className="text-success font-medium">OK</span></td>
                                        <td className="p-4 text-right">44.8s</td>
                                    </tr>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">10:32:15</td>
                                        <td className="p-4"><span className="text-warning font-medium">REWORK</span></td>
                                        <td className="p-4 text-right">12.0s</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
