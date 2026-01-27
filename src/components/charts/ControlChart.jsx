import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const ControlChart = ({ title, data, dataKey, ucl, lcl, cl, color = "hsl(var(--primary))" }) => (
    <Card className="col-span-1 border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="timestamp"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[lcl - (ucl - lcl) * 0.2, ucl + (ucl - lcl) * 0.2]}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                backgroundColor: 'hsl(var(--card))'
                            }}
                        />

                        {/* Control Limits */}
                        <ReferenceLine y={ucl} label="UCL" stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                        <ReferenceLine y={cl} label="CL" stroke="hsl(var(--muted-foreground))" />
                        <ReferenceLine y={lcl} label="LCL" stroke="hsl(var(--destructive))" strokeDasharray="3 3" />

                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: color }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-muted-foreground">
                <span className="text-destructive">UCL: {ucl}</span>
                <span>CL: {cl}</span>
                <span className="text-destructive">LCL: {lcl}</span>
            </div>
        </CardContent>
    </Card>
);

export default ControlChart;
