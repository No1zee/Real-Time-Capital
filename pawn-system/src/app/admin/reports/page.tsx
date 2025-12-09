import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadReportButton } from "@/components/admin/download-report-button"
import { getLoanBookReport, getAuctionSalesReport, getUserDirectoryReport } from "@/app/actions/admin/reports"
import { getRevenueReport } from "@/app/actions/admin/revenue-reports"
import { getLoanPerformanceMetrics } from "@/app/actions/admin/loan-analytics"
import { getInventoryMetrics } from "@/app/actions/admin/inventory-analytics"
import { FileBarChart, Users, DollarSign, BookOpen, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { RevenueChart } from "@/components/admin/charts/RevenueChart"
import { CustomPieChart } from "@/components/admin/charts/CustomPieChart"
import { MetricCard } from "@/components/admin/charts/MetricCard"
import { ReportExportButtons } from "./report-export-buttons"

export default async function AdminReportsPage() {
    const session = await auth()
    const user = session?.user as any

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        redirect("/portal")
    }

    // Get analytics data for last 30 days
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-slate-500 mt-1">Business intelligence and downloadable reports</p>
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
                    icon={<DollarSign className="h-4 w-4 text-slate-500" />}
                    trend={{
                        value: revenueReport.growth.percentage,
                        direction: revenueReport.growth.trend === "stable" ? "neutral" : revenueReport.growth.trend
                    }}
                />
                <MetricCard
                    title="Active Loans"
                    value={loanMetrics.activeLoans}
                    subtitle={`$${loanMetrics.averageLoanSize.toFixed(0)} avg size`}
                    icon={<TrendingUp className="h-4 w-4 text-slate-500" />}
                />
                <MetricCard
                    title="Inventory Turnover"
                    value={`${inventoryMetrics.turnoverRate.toFixed(1)}%`}
                    subtitle={`${inventoryMetrics.averageDaysToSell.toFixed(0)} days to sell`}
                    icon={<Package className="h-4 w-4 text-slate-500" />}
                />
                <MetricCard
                    title="Default Rate"
                    value={`${loanMetrics.defaultRate.toFixed(1)}%`}
                    subtitle={`${loanMetrics.defaultedLoans} defaulted`}
                    icon={<AlertTriangle className="h-4 w-4 text-slate-500" />}
                    className={loanMetrics.defaultRate > 10 ? "border-red-500/50" : ""}
                />
            </div>

            {/* Revenue Analytics Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Revenue Trend</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Daily revenue for the last 30 days</p>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={revenueReport.dailyRevenue} />
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Revenue by Source</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Distribution across transaction types</p>
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
            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Top Revenue Categories</CardTitle>
                    <CardDescription>Best performing item categories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {revenueReport.topCategories.map((cat, index) => (
                            <div key={cat.category} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-slate-900 dark:text-white font-medium">{cat.category}</span>
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

            {/* Loan Performance Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Loan Status Distribution</CardTitle>
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

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Risk Distribution</CardTitle>
                        <CardDescription>Loans by risk category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loanMetrics.riskDistribution.map((risk) => (
                                <div key={risk.category} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">{risk.category}</span>
                                        <span className="text-slate-900 dark:text-white font-medium">{risk.count} loans</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
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
            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Category Performance</CardTitle>
                    <CardDescription>Turnover rate by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {inventoryMetrics.categoryPerformance.slice(0, 5).map((cat) => (
                            <div key={cat.category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">{cat.category}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-500 dark:text-slate-400">{cat.soldItems}/{cat.totalItems} sold</span>
                                        <span className="text-amber-500 font-medium">
                                            {cat.turnoverRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
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
                <Card className="bg-white dark:bg-slate-950 border-amber-500/30">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Slow-Moving Inventory
                        </CardTitle>
                        <CardDescription>Items in inventory for more than 90 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inventoryMetrics.slowMovingItems.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-medium">{item.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-amber-500 font-bold">{item.daysInInventory} days</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">${item.valuation.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* CSV Download Reports Section */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Downloadable Reports</h2>
                <p className="text-slate-500 mb-6">Generate and download detailed CSV reports</p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Loan Book */}
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle>Loan Book</CardTitle>
                            <CardDescription>All active loans, debts, and collateral status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DownloadReportButton
                                reportName="Download Loan CSV"
                                fetchData={getLoanBookReport}
                                fileName="loan_book_report"
                            />
                        </CardContent>
                    </Card>

                    {/* Sales Report */}
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <CardTitle>Auction Sales</CardTitle>
                            <CardDescription>Completed sales, revenue, and item details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DownloadReportButton
                                reportName="Download Sales CSV"
                                fetchData={getAuctionSalesReport}
                                fileName="auction_sales_report"
                            />
                        </CardContent>
                    </Card>

                    {/* User Directory */}
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <CardTitle>User Directory</CardTitle>
                            <CardDescription>User list with KYC status and current roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DownloadReportButton
                                reportName="Download Users CSV"
                                fetchData={getUserDirectoryReport}
                                fileName="user_directory_report"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
