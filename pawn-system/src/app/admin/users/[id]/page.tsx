
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserCRMStats } from "@/app/actions/admin/analytics"
import { UserInterestChart } from "@/components/admin/user-interest-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Calendar, DollarSign, Eye, ShoppingBag, Clock } from "lucide-react"
import Link from "next/link"

interface AdminUserDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: { bids: true, transactions: true, disputes: true }
            }
        }
    })

    if (!user) notFound()

    const stats = await getUserCRMStats(id)

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unknown User"}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        {user.role}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "destructive"} className="text-sm px-3 py-1">
                        {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Interests */}
                <div className="space-y-6 lg:col-span-2">
                    {/* CRM Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Visits (30d)</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.visitsLast30Days}</div>
                                <p className="text-xs text-muted-foreground">logins recorded</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalSpend)}</div>
                                <p className="text-xs text-muted-foreground">{stats.purchaseCount} transactions</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Last Active</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold truncate">
                                    {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : "Never"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.lastActive ? new Date(stats.lastActive).toLocaleTimeString() : "-"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts & Graphs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UserInterestChart interests={stats.interests} />

                        {/* Additional insights card or placeholder */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-400">Account Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Wallet Balance</span>
                                    <span className="font-bold">{formatCurrency(Number(user.walletBalance))}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Verification</span>
                                    <Badge variant={user.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                                        {user.verificationStatus}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center border-b border-border pb-2">
                                    <span className="text-sm text-muted-foreground">Total Bids</span>
                                    <span className="font-mono">{user._count.bids}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Disputes</span>
                                    <span className={`font-mono ${user._count.disputes > 0 ? "text-red-500 font-bold" : ""}`}>
                                        {user._count.disputes}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Recent Purchases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Method</th>
                                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Reference</th>
                                            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {stats.recentPurchases.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="h-24 text-center text-muted-foreground">No purchases yet.</td>
                                            </tr>
                                        ) : (
                                            stats.recentPurchases.map((purchase) => (
                                                <tr key={purchase.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-2 align-middle">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-2 align-middle">{purchase.method}</td>
                                                    <td className="p-2 align-middle font-mono text-xs">{purchase.reference}</td>
                                                    <td className="p-2 align-middle text-right font-medium">{formatCurrency(Number(purchase.amount))}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Metadata / Notes (Could expand later) */}
                <div className="space-y-6">
                    <Card className="glass-card bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Marketing Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Generated based on interaction history.
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Top Category</span>
                                    <p className="text-lg font-bold">{stats.interests[0]?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Customer Value</span>
                                    <p className="text-lg font-bold">
                                        {stats.totalSpend > 5000 ? "High Value (VIP)" : stats.totalSpend > 1000 ? "Regular" : "New / Low"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Engagement</span>
                                    <p className="text-lg font-bold">
                                        {stats.visitsLast30Days > 20 ? "Highly Active" : stats.visitsLast30Days > 5 ? "Active" : "Dormant"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm">
                        <strong>Admin Insight:</strong> This user has viewed listing details {stats.visitsLast30Days} times this month. Consider sending targeted offers for {stats.interests[0]?.name || "items"}.
                    </div>
                </div>
            </div>
        </div>
    )
}
