"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DataPoint {
    name: string
    value: number
    [key: string]: string | number
}

interface CustomPieChartProps {
    data: DataPoint[]
    title?: string
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export function CustomPieChart({ data, title }: CustomPieChartProps) {
    return (
        <div className="w-full" style={{ height: 250 }}>
            {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
