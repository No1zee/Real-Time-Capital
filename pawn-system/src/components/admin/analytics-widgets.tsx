"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"

export function AnalyticsWidgets({
    revenueData,
    growthData
}: {
    revenueData: any[],
    growthData: any[]
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400">Revenue (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400">User Growth (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={growthData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    dot={{ fill: "#ec4899" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
