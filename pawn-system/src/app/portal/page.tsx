
import { getCustomerLoans, getCustomerItems } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FileText, Package, AlertCircle } from "lucide-react"

export default async function PortalDashboard() {
    const loans = await getCustomerLoans()
    const items = await getCustomerItems()
    // const loans: any[] = []
    // const items: any[] = []

    const activeLoans = loans.filter(l => l.status === "ACTIVE" || l.status === "OVERDUE")
    const totalDebt = activeLoans.reduce((sum, loan) => {
        return sum + Number(loan.principalAmount)
    }, 0)

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400">Welcome back! Here is an overview of your account.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Loans</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeLoans.length}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Loans currently in progress</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Principal Due</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalDebt)}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Excluding interest</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Items in Pawn</CardTitle>
                        <Package className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Items currently held as collateral</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity or Quick Actions could go here */}
        </div>
    )
}
