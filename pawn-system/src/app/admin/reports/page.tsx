import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getInventoryValuationStats, getLoanStats, getRecentCashFlow } from "@/app/actions/admin/reports"
import { ReportsDashboard } from "@/components/admin/reports/reports-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminReportsPage() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const [inventoryData, loanData, cashFlowData] = await Promise.all([
        getInventoryValuationStats(),
        getLoanStats(),
        getRecentCashFlow()
    ])

    // Handle Authorization Errors from actions
    if ('error' in inventoryData || 'error' in loanData || 'error' in cashFlowData) {
        return <div>Unauthorized Access</div>
    }

    // Fix: Serialize Decimal objects to plain JSON before passing to Client Component
    const safeInventory = JSON.parse(JSON.stringify(inventoryData))
    const safeLoans = JSON.parse(JSON.stringify(loanData))
    const safeCashFlow = JSON.parse(JSON.stringify(cashFlowData))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                <p className="text-muted-foreground">Strategic insights into inventory, loans, and cash flow.</p>
            </div>

            <ReportsDashboard
                inventory={safeInventory}
                loans={safeLoans}
                cashFlow={safeCashFlow}
            />
        </div>
    )
}
