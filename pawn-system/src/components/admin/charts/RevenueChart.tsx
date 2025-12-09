"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface RevenueChartProps {
    data: { date: string; amount: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    // Transform data for chart
    const chartData = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: d.amount
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                <XAxis
                    dataKey="date"
                    className="text-xs"
                    stroke="#64748b"
                />
                <YAxis
                    className="text-xs"
                    stroke="#64748b"
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
