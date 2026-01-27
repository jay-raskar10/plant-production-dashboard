import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPC_DATA } from '@/lib/data';
import { useFilters } from '@/context/FilterContext';
import ControlChart from '@/components/charts/ControlChart';

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

            {/* P-Chart placeholder */}
            <Card className="col-span-1 border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-base font-semibold">P-Chart (Defect Rate)</CardTitle></CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                        Statistics will appear here
                    </div>
                </CardContent>
            </Card>

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
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
