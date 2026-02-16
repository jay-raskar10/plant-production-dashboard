import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDisplayMode } from '@/context/DisplayModeContext';

const ControlChart = ({ title, data, dataKey, ucl, lcl, cl, color = "hsl(var(--primary))" }) => {
    const { chartFontSize, chartRefFontSize, chartStrokeWidth, chartDotRadius, chartActiveDotRadius, chartHeight } = useDisplayMode();

    return (
        <Card className="col-span-1 border border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`${chartHeight} w-full`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                domain={[lcl - (ucl - lcl) * 0.2, ucl + (ucl - lcl) * 0.2]}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={chartFontSize}
                                tickLine={false}
                                axisLine={false}
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

                            {/* Control Limits — bold, prominent */}
                            <ReferenceLine y={ucl} label={{ value: `UCL: ${ucl}`, position: 'right', fill: 'hsl(var(--destructive))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--destructive))" strokeDasharray="6 3" strokeWidth={chartStrokeWidth} />
                            <ReferenceLine y={cl} label={{ value: `CL: ${cl}`, position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
                            <ReferenceLine y={lcl} label={{ value: `LCL: ${lcl}`, position: 'right', fill: 'hsl(var(--destructive))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--destructive))" strokeDasharray="6 3" strokeWidth={chartStrokeWidth} />

                            <Line
                                type="linear"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={1.5}
                                dot={{ r: chartDotRadius, fill: color }}
                                activeDot={{ r: chartActiveDotRadius }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
                    <span className="text-destructive font-mono">UCL: {ucl}</span>
                    <span className="text-muted-foreground font-mono">CL: {cl}</span>
                    <span className="text-destructive font-mono">LCL: {lcl}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ControlChart;
