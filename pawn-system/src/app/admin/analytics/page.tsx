import { getRevenueReport, exportRevenueToCSV } from "@/app/actions/admin/revenue-reports"
import { getLoanPerformanceMetrics, exportLoanAnalyticsToCSV } from "@/app/actions/admin/loan-analytics"
import { getInventoryMetrics, exportInventoryAnalyticsToCSV } from "@/app/actions/admin/inventory-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/admin/charts/RevenueChart"
import { CustomPieChart } from "@/components/admin/charts/CustomPieChart"
import { MetricCard } from "@/components/admin/charts/MetricCard"
import { DollarSign, TrendingUp, Package, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ReportExportButtons } from "./ReportExportButtons"

export default async function AnalyticsPage() {
    // Get last 30 days data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const revenueReport = await getRevenueReport({ startDate, endDate })
    const loanMetrics = await getLoanPerformanceMetrics({ startDate, endDate })
    const inventoryMetrics = await getInventoryMetrics({ startDate, endDate })

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Business Analytics
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Comprehensive insights for the last 30 days
                    </p>
                </div>
                <ReportExportButtons
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={`$${revenueReport.totalRevenue.toFixed(2)}`}
                    subtitle="Last 30 days"
                    icon={DollarSign}
                    trend={{
                        value: revenueReport.growth.percentage,
                        direction: revenueReport.growth.trend === "stable" ? "neutral" : revenueReport.growth.trend
                    }}
                />
                <MetricCard
                    title="Active Loans"
                    value={loanMetrics.activeLoans}
                    subtitle={`$${loanMetrics.averageLoanSize.toFixed(0)} avg size`}
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Inventory Turnover"
                    value={`${inventoryMetrics.turnoverRate.toFixed(1)}%`}
                    subtitle={`${inventoryMetrics.averageDaysToSell.toFixed(0)} days to sell`}
                    icon={Package}
                />
                <MetricCard
                    title="Default Rate"
                    value={`${loanMetrics.defaultRate.toFixed(1)}%`}
                    subtitle={`${loanMetrics.defaultedLoans} defaulted`}
                    icon={AlertTriangle}
                    className={loanMetrics.defaultRate > 10 ? "border-red-500/50" : ""}
                />
            </div>

            {/* Revenue Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Trend</CardTitle>
                        <p className="text-sm text-slate-400">Daily revenue for the last 30 days</p>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={revenueReport.dailyRevenue} />
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue by Source</CardTitle>
                        <p className="text-sm text-slate-400">Distribution across transaction types</p>
                    </CardHeader>
                    <CardContent>
                        <CustomPieChart
                            data={revenueReport.revenueBySource.map(s => ({
                                name: s.source,
                                value: s.amount
                            }))}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Top Revenue Categories */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-white">Top Revenue Categories</CardTitle>
                    <p className="text-sm text-slate-400">Best performing item categories</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {revenueReport.topCategories.map((cat, index) => (
                            <div key={cat.category} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-white font-medium">{cat.category}</span>
                                </div>
                                <span className="text-amber-500 font-bold">
                                    ${cat.revenue.toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {revenueReport.topCategories.length === 0 && (
                            <p className="text-slate-400 text-center py-4">No revenue data yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Loan Performance */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Loan Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomPieChart
                            data={[
                                { name: "Active", value: loanMetrics.activeLoans },
                                { name: "Completed", value: loanMetrics.completedLoans },
                                { name: "Defaulted", value: loanMetrics.defaultedLoans }
                            ].filter(d => d.value > 0)}
                        />
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Risk Distribution</CardTitle>
                        <p className="text-sm text-slate-400">Loans by risk category</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loanMetrics.riskDistribution.map((risk) => (
                                <div key={risk.category} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300">{risk.category}</span>
                                        <span className="text-white font-medium">{risk.count} loans</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${loanMetrics.totalLoans > 0 ? (risk.count / loanMetrics.totalLoans) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Performance */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-white">Category Performance</CardTitle>
                    <p className="text-sm text-slate-400">Turnover rate by category</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {inventoryMetrics.categoryPerformance.slice(0, 5).map((cat) => (
                            <div key={cat.category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">{cat.category}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-400">{cat.soldItems}/{cat.totalItems} sold</span>
                                        <span className="text-amber-500 font-medium">
                                            {cat.turnoverRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(cat.turnoverRate, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Slow-Moving Items Alert */}
            {inventoryMetrics.slowMovingItems.length > 0 && (
                <Card className="glass-card border-amber-500/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Slow-Moving Inventory
                        </CardTitle>
                        <p className="text-sm text-slate-400">Items in inventory for more than 90 days</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inventoryMetrics.slowMovingItems.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                                    <div>
                                        <p className="text-white font-medium">{item.name}</p>
                                        <p className="text-sm text-slate-400">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-amber-500 font-bold">{item.daysInInventory} days</p>
                                        <p className="text-sm text-slate-400">${item.valuation.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
