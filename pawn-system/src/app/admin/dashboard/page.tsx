import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPaymentTable } from "@/components/admin/payment-table"
import { AdminVerificationTable } from "@/components/admin/verification-table"
import { getPendingTransactions } from "@/app/actions/payments"
import { getPendingVerifications } from "@/app/actions/kyc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, Gavel, DollarSign, AlertCircle, ArrowLeft, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
// New Imports
import { getRevenueData, getUserGrowthData, getBusinessKPIs } from "@/app/actions/admin/analytics"
import { AnalyticsWidgets } from "@/components/admin/analytics-widgets"
import { BusinessKPIGrid } from "@/components/admin/business-kpi-grid"
import { ProTipTrigger } from "@/components/tips/pro-tip-trigger"

export default async function AdminDashboardPage() {
    const session = await auth()
    const user = session?.user as any

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        redirect("/portal")
    }

    const pendingTransactions = await getPendingTransactions()
    const revenueData = await getRevenueData()
    const growthData = await getUserGrowthData()
    const businessKPIs = await getBusinessKPIs()

    // Fetch some basic stats
    const totalUsers = await prisma.user.count()
    const activeAuctions = await prisma.auction.count({ where: { status: "ACTIVE" } })
    const totalVolume = await prisma.transaction.aggregate({
        where: { status: "COMPLETED", type: "PAYMENT" },
        _sum: { amount: true }
    })

    return (
        <div className="p-8 space-y-8 min-h-screen text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <Link href="/portal" className="inline-flex items-center text-sm text-slate-400 hover:text-amber-500 transition-colors mt-1">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Overview
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/reports/kpi">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                            <TrendingUp className="w-4 h-4" />
                            View Business Intelligence
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/20">
                        <AlertCircle className="w-4 h-4" />
                        {pendingTransactions.length} Pending Actions
                    </div>
                </div>
            </div>

            {/* Business Intelligence KPIs */}
            <BusinessKPIGrid data={businessKPIs} />

            <div className="grid gap-4 md:grid-cols-3">
                <ProTipTrigger tipId="admin-total-users">
                    <Card className="glass-card h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</div>
                        </CardContent>
                    </Card>
                </ProTipTrigger>
                <ProTipTrigger tipId="admin-active-auctions">
                    <Card className="glass-card h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Active Auctions</CardTitle>
                            <Gavel className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeAuctions}</div>
                        </CardContent>
                    </Card>
                </ProTipTrigger>
                <ProTipTrigger tipId="admin-total-volume">
                    <Card className="glass-card h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Volume</CardTitle>
                            <DollarSign className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(Number(totalVolume._sum.amount || 0))}
                            </div>
                        </CardContent>
                    </Card>
                </ProTipTrigger>
            </div>

            {/* Analytics Section */}
            <AnalyticsWidgets revenueData={revenueData} growthData={growthData} />

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Pending Verifications</h2>
                <AdminVerificationTable users={(await getPendingVerifications()).map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    idImage: u.idImage,
                    createdAt: u.createdAt.toISOString()
                }))} />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Pending Payments</h2>
                <AdminPaymentTable initialTransactions={pendingTransactions.map(t => ({
                    id: t.id,
                    amount: t.amount.toNumber(),
                    method: t.method,
                    reference: t.reference,
                    status: t.status,
                    createdAt: t.createdAt.toISOString(),
                    user: {
                        name: t.User.name,
                        email: t.User.email
                    }
                }))} />
            </div>
        </div>
    )
}
