"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart, PieChart, Pie, Cell, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"

type InventoryStats = {
    valuationByCategory: any[]
    statusDistribution: any[]
}

type LoanStats = {
    activeLoans: { _sum: { principalAmount: number | null } | null; _count: { id: number } }
    overdueLoans: number
    performance: { completed: number; defaulted: number; total: number }
}

type CashFlow = {
    date: string
    amount: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ReportsDashboard({
    inventory,
    loans,
    cashFlow
}: {
    inventory: InventoryStats;
    loans: LoanStats;
    cashFlow: CashFlow[]
}) {
    // Process chart data
    const categoryData = inventory.valuationByCategory.map(item => ({
        name: item.category.replace("_", " "),
        value: item._sum.finalValuation ? Number(item._sum.finalValuation) : 0,
        count: item._count.id
    }))

    const activeLoanPrincipal = loans.activeLoans._sum?.principalAmount ? Number(loans.activeLoans._sum.principalAmount) : 0

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loan Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(activeLoanPrincipal)}</div>
                        <p className="text-xs text-muted-foreground">{loans.activeLoans._count.id} active loans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{loans.overdueLoans}</div>
                        <p className="text-xs text-muted-foreground">Action required</p>
                    </CardContent>
                </Card>
                {/* Add more KPIs if needed */}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Chart 1: Asset Valuation by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Valuation Distribution</CardTitle>
                        <CardDescription>Total pawn value by asset type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chart 2: Cash Flow Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Cash Flow</CardTitle>
                        <CardDescription>Payments received (Last 30 Days)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cashFlow}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Chart 3: Loan Status Pie?? Or Performance */}
        </div>
    )
}
