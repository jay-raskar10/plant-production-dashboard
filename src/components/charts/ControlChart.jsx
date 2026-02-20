import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDisplayMode } from '@/context/DisplayModeContext';

const ControlChart = ({ title, data, dataKey, ucl, lcl, cl, color = "hsl(var(--primary))" }) => {
    const { chartFontSize, chartRefFontSize, chartStrokeWidth, chartDotRadius, chartActiveDotRadius, chartHeight } = useDisplayMode();

    // Limit points for performance
    const MAX_POINTS = 2000;

    // Memoized downsampling function
    const processedData = React.useMemo(() => {
        if (!data || data.length <= MAX_POINTS) return data;

        const samplingRate = Math.ceil(data.length / MAX_POINTS);
        return data.filter((_, index) => index % samplingRate === 0);
    }, [data]);

    const isDownsampled = data && data.length > MAX_POINTS;

    return (
        <Card className="col-span-1 border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {isDownsampled && (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded" title={`Showing ~${processedData.length} of ${data.length} points`}>
                        Optimized View
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className={`${chartHeight} w-full`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="time_label"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={chartFontSize}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                // Prevent crowding on x-axis with large datasets by auto-skipping ticks
                                interval="preserveStartEnd"
                                minTickGap={30}
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
                            // Show original index if needed, but time is usually enough
                            />

                            {/* Control Limits — bold, prominent */}
                            <ReferenceLine y={ucl} label={{ value: `UCL: ${ucl}`, position: 'right', fill: 'hsl(var(--destructive))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--destructive))" strokeDasharray="6 3" strokeWidth={chartStrokeWidth} />
                            <ReferenceLine y={cl} label={{ value: `CL: ${cl}`, position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
                            <ReferenceLine y={lcl} label={{ value: `LCL: ${lcl}`, position: 'right', fill: 'hsl(var(--destructive))', fontSize: chartRefFontSize, fontWeight: 'bold' }} stroke="hsl(var(--destructive))" strokeDasharray="6 3" strokeWidth={chartStrokeWidth} />

                            <Line
                                type="monotone" // smoother line for trends
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={1.5}
                                dot={isDownsampled ? false : { r: chartDotRadius, fill: color }} // Hide dots when downsampled for cleaner look
                                activeDot={{ r: chartActiveDotRadius }}
                                isAnimationActive={!isDownsampled} // Disable animation for large datasets
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
