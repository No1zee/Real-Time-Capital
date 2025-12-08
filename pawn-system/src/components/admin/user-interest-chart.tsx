"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function UserInterestChart({
    interests
}: {
    interests: { name: string, value: number }[]
}) {
    const COLORS = ["#f59e0b", "#ec4899", "#3b82f6", "#10b981", "#8b5cf6"]

    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400">Category Preferences</CardTitle>
            </CardHeader>
            <CardContent>
                {interests.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                        No activity data available
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center">
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie
                                    data={interests}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {interests.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/2 space-y-2 text-sm">
                            {interests.slice(0, 5).map((interest, index) => (
                                <div key={interest.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-slate-300">{interest.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-100">{interest.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
