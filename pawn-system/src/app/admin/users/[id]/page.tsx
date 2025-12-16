
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUserCRMStats } from "@/app/actions/admin/analytics"
import { UserInterestChart } from "@/components/admin/user-interest-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Calendar, DollarSign, Eye, ShoppingBag, Clock, Info, HelpCircle, LayoutDashboard, History, CheckSquare, FileText } from "lucide-react"
import Link from "next/link"
import { PermissionsEditor } from "@/components/admin/permissions-editor"
import { ProTipTrigger } from "@/components/tips/pro-tip-trigger"
import { UserTrustScore } from "@/components/admin/users/user-trust-score"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCRMNotes, getCRMTasks, getInteractionLogs, getAvailableTags, getAvailableTagsForUser } from "@/app/actions/admin/crm"
import { NoteTimeline } from "@/components/admin/crm/note-timeline"
import { TaskBoard } from "@/components/admin/crm/task-board"
import { CRMTagManager } from "@/components/admin/crm/tag-manager"
import { InteractionLogger } from "@/components/admin/crm/interaction-logger"
import { DocumentVault } from "@/components/admin/crm/document-vault"

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
                select: { Bid: true, Transaction: true, Dispute: true }
            }
        }
    })

    if (!user) notFound()

    // Parallel Data Fetching
    const [stats, notes, tasks, logs, allTags, userTags] = await Promise.all([
        getUserCRMStats(id),
        getCRMNotes(id),
        getCRMTasks(id),
        getInteractionLogs(id),
        getAvailableTags(),
        getAvailableTagsForUser(id)
    ])

    // Convert Date objects to strings if needed for client components, 
    // but Next.js Server Components pass Dates fine to Client Components in recent versions.
    // If issues arise, we'll map them. "Assignee" in tasks might be null.

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unknown User"}</h1>
                                <UserTrustScore userId={user.id} />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-muted-foreground">{user.email}</p>
                                <span className="text-border">|</span>
                                <Badge variant="outline" className="text-xs">{user.role}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Suspended"}
                            </Badge>
                            <Badge variant={user.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                                {user.verificationStatus}
                            </Badge>
                        </div>
                        <CRMTagManager userId={user.id} initialTags={userTags} availableTags={allTags} />
                    </div>
                </div>
            </div>

            {/* Quick Actions / Interaction Logger */}
            <InteractionLogger userId={user.id} />

            {/* TABS */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg gap-2"><LayoutDashboard className="w-4 h-4" /> Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-lg gap-2"><History className="w-4 h-4" /> Timeline & Notes</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-lg gap-2"><CheckSquare className="w-4 h-4" /> Tasks</TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-lg gap-2"><FileText className="w-4 h-4" /> Documents</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB (Original Content) */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
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
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-muted-foreground">Category Preferences</h3>
                                        <ProTipTrigger tipId="profile-interests">
                                            <Info className="h-4 w-4 text-muted-foreground hover:text-amber-500 cursor-help" />
                                        </ProTipTrigger>
                                    </div>
                                    <UserInterestChart interests={stats.interests} />
                                </div>

                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                            Account Health
                                            <ProTipTrigger tipId="profile-health">
                                                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-amber-500 cursor-help" />
                                            </ProTipTrigger>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-border pb-2">
                                            <span className="text-sm text-muted-foreground">Wallet Balance</span>
                                            <span className="font-bold">{formatCurrency(Number(user.walletBalance))}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-border pb-2">
                                            <span className="text-sm text-muted-foreground">Total Bids</span>
                                            <span className="font-mono">{user._count.Bid}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Disputes</span>
                                            <span className={`font-mono ${user._count.Dispute > 0 ? "text-red-500 font-bold" : ""}`}>
                                                {user._count.Dispute}
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
                                                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Ref</th>
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

                        {/* Right Column: Metadata / Notes */}
                        <div className="space-y-6">
                            <Card className="glass-card bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Marketing Profile
                                        <ProTipTrigger tipId="profile-marketing">
                                            <Info className="h-4 w-4 text-muted-foreground hover:text-amber-500 cursor-help" />
                                        </ProTipTrigger>
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
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions Editor */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">Permissions</h3>
                                    <ProTipTrigger tipId="profile-permissions">
                                        <Info className="h-4 w-4 text-muted-foreground hover:text-amber-500 cursor-help" />
                                    </ProTipTrigger>
                                </div>
                                <PermissionsEditor
                                    userId={user.id}
                                    initialPermissions={(user.permissions || "").split(',').filter(Boolean)}
                                    initialRole={user.role}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TIMELINE TAB */}
                <TabsContent value="timeline" className="animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NoteTimeline userId={user.id} initialNotes={notes as any} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TASKS TAB */}
                <TabsContent value="tasks" className="animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasks & Reminders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TaskBoard userId={user.id} initialTasks={tasks as any} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCS TAB */}
                <TabsContent value="docs" className="animate-in fade-in-50 slide-in-from-bottom-2">
                    <DocumentVault documents={[]} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
