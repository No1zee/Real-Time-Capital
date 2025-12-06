import { auth } from "@/auth"
import { getFinancialStats, getInventoryStats, getRecentActivity } from "@/app/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, Package, Activity, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const financial = await getFinancialStats()
    const inventory = await getInventoryStats()
    const activity = await getRecentActivity()

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
            </div>

            {/* Financial Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Principal Lent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financial.totalPrincipal)}</div>
                        <p className="text-xs text-muted-foreground">Across all loans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interest Expected</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(financial.totalInterestExpected)}</div>
                        <p className="text-xs text-muted-foreground">Projected revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(financial.totalRepaid)}</div>
                        <p className="text-xs text-muted-foreground">Cash collected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(financial.outstandingBalance)}</div>
                        <p className="text-xs text-muted-foreground">To be collected</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Inventory Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Inventory Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Valuation</p>
                                    <p className="text-2xl font-bold">{formatCurrency(inventory.totalValuation)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                    <p className="text-2xl font-bold">{inventory.totalItems}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(inventory.statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center border-b pb-2">
                                        <span className="text-sm capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                                        <span className="font-mono font-bold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activity.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No recent activity.</p>
                            ) : (
                                activity.map((item, i) => (
                                    <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                        <div className={`mt-1 p-2 rounded-full ${item.type === 'LOAN_CREATED' ? 'bg-blue-100 text-blue-600' :
                                                item.type === 'PAYMENT_RECEIVED' ? 'bg-green-100 text-green-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>
                                            {item.type === 'LOAN_CREATED' ? <DollarSign className="w-4 h-4" /> :
                                                item.type === 'PAYMENT_RECEIVED' ? <CreditCard className="w-4 h-4" /> :
                                                    <Package className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.description}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                                                <span className="text-sm font-bold">{formatCurrency(item.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
