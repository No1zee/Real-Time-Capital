
import { getCustomerLoans, getCustomerItems } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FileText, Package, AlertCircle, TrendingUp, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProTipTrigger } from "@/components/tips/pro-tip-trigger"
import { KnowledgeWidget } from "@/components/content/knowledge-widget"

export default async function PortalDashboard() {
    const loans = await getCustomerLoans()
    const items = await getCustomerItems()

    const activeLoans = loans.filter(l => l.status === "ACTIVE" || l.status === "DEFAULTED")
    const pendingLoans = loans.filter(l => l.status === "PENDING" || l.status === "APPROVED")
    const totalDebt = activeLoans.reduce((sum, loan) => {
        return sum + Number(loan.principalAmount)
    }, 0)

    return (
        <div className="space-y-4 md:space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                    <p className="text-sm md:text-base text-slate-400">Welcome back! Here is an overview of your account.</p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                        Verified Member
                    </span>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[180px]">

                {/* Main Stat: Total Debt (Large Card) */}
                <ProTipTrigger tipId="portal-total-debt" className="col-span-2 md:col-span-2 md:row-span-2">
                    <Card className="glass-card flex flex-col justify-between relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 md:w-32 h-24 md:h-32 text-amber-500" />
                        </div>
                        <CardHeader className="pb-2 md:pb-6">
                            <CardTitle className="text-sm md:text-base text-slate-400 font-medium">Total Principal Due</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tight">
                                {formatCurrency(totalDebt)}
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm">
                                Across {activeLoans.length} active loans.
                            </p>
                            <div className="mt-4 md:mt-6">
                                <Link href="/portal/loans">
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold w-full md:w-auto text-sm md:text-base h-9 md:h-10">
                                        Manage Loans
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </ProTipTrigger>

                {/* Stat: Active Loans */}
                <ProTipTrigger tipId="portal-active-loans" className="col-span-1 md:col-span-1">
                    <Card className="glass-card h-full flex flex-col justify-center hover:border-amber-500/50 transition-colors cursor-pointer group relative">
                        <Link href="/portal/loans?status=ACTIVE" className="absolute inset-0 z-10">
                            <span className="sr-only">View Active Loans</span>
                        </Link>
                        <CardHeader className="pb-1 md:pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs md:text-sm font-medium text-slate-400">Active Loans</CardTitle>
                                <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{activeLoans.length}</div>
                            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">In progress</p>
                        </CardContent>
                    </Card>
                </ProTipTrigger>

                {/* Stat: Pending Loans */}
                <ProTipTrigger tipId="portal-pending-loans" className="col-span-1 md:col-span-1">
                    <Card className="glass-card h-full flex flex-col justify-center hover:border-amber-500/50 transition-colors cursor-pointer group relative">
                        <Link href="/portal/loans" className="absolute inset-0 z-10">
                            <span className="sr-only">View Pending Loans</span>
                        </Link>
                        <CardHeader className="pb-1 md:pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs md:text-sm font-medium text-slate-400">Pending Applications</CardTitle>
                                <Clock className="h-3 w-3 md:h-4 md:w-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{pendingLoans.length}</div>
                            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">Under review</p>
                        </CardContent>
                    </Card>
                </ProTipTrigger>

                {/* Stat: Items in Pawn */}
                <ProTipTrigger tipId="portal-items-pawned" className="col-span-1 md:col-span-1">
                    <Card className="glass-card h-full flex flex-col justify-center hover:border-amber-500/50 transition-colors cursor-pointer group relative">
                        <Link href="/portal/loans" className="absolute inset-0 z-10">
                            <span className="sr-only">View Items</span>
                        </Link>
                        <CardHeader className="pb-1 md:pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs md:text-sm font-medium text-slate-400">Items in Pawn</CardTitle>
                                <Package className="h-3 w-3 md:h-4 md:w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{items.pawnedItems.length}</div>
                            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">Collateral held</p>
                        </CardContent>
                    </Card>
                </ProTipTrigger>

                {/* Trust Signal (Moved up to fit grid) */}
                <Card className="glass-card col-span-1 md:col-span-2 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                    <CardContent className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-4 p-3 md:p-6">
                        <div className="p-2 md:p-3 rounded-full bg-green-500/10 text-green-500">
                            <ShieldCheck className="w-5 h-5 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xs md:text-base text-slate-900 dark:text-white">Secure & Trusted</h3>
                            <p className="text-[10px] md:text-xs text-slate-400 hidden md:block">Your items are stored in our secure, insured facility.</p>
                            <p className="text-[9px] text-slate-400 md:hidden">Fully Insured Storage</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Action: Auctions */}
                <Card className="glass-card col-span-2 md:col-span-2 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-16 md:w-24 h-16 md:h-24 text-slate-900/10 dark:text-white/10" />
                    </div>
                    <CardHeader className="pb-2 md:pb-6">
                        <CardTitle className="text-base md:text-lg text-slate-900 dark:text-white">Live Auctions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">
                            Check out the latest items up for bid. Don't miss out on great deals.
                        </p>
                        <Link href="/portal/auctions">
                            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm md:text-base h-9 md:h-10">
                                Browse Auctions
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>

            {/* Knowledge Hub Widget */}
            <KnowledgeWidget category="general" title="Getting Started" limit={4} />
        </div >
    )
}
