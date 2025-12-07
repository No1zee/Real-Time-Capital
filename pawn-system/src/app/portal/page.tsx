
import { getCustomerLoans, getCustomerItems } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FileText, Package, AlertCircle, TrendingUp, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PortalDashboard() {
    const loans = await getCustomerLoans()
    const items = await getCustomerItems()

    const activeLoans = loans.filter(l => l.status === "ACTIVE" || l.status === "DEFAULTED")
    const totalDebt = activeLoans.reduce((sum, loan) => {
        return sum + Number(loan.principalAmount)
    }, 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                    <p className="text-slate-400">Welcome back! Here is an overview of your account.</p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                        Verified Member
                    </span>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]">

                {/* Main Stat: Total Debt (Large Card) */}
                <Card className="glass-card md:col-span-2 md:row-span-2 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-32 h-32 text-amber-500" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-slate-400 font-medium">Total Principal Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                            {formatCurrency(totalDebt)}
                        </div>
                        <p className="text-slate-400 text-sm">
                            Across {activeLoans.length} active loans.
                        </p>
                        <div className="mt-6">
                            <Link href="/portal/loans">
                                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold w-full md:w-auto">
                                    Manage Loans
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Stat: Active Loans */}
                <Card className="glass-card md:col-span-1 flex flex-col justify-center hover:border-amber-500/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Active Loans</CardTitle>
                            <FileText className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{activeLoans.length}</div>
                        <p className="text-xs text-slate-500 mt-1">In progress</p>
                    </CardContent>
                </Card>

                {/* Stat: Items in Pawn */}
                <Card className="glass-card md:col-span-1 flex flex-col justify-center hover:border-amber-500/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-400">Items in Pawn</CardTitle>
                            <Package className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{items.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Collateral held</p>
                    </CardContent>
                </Card>

                {/* Quick Action: Auctions */}
                <Card className="glass-card md:col-span-2 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-24 h-24 text-white" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white">Live Auctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400 text-sm mb-4">
                            Check out the latest items up for bid. Don't miss out on great deals.
                        </p>
                        <Link href="/portal/auctions">
                            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                                Browse Auctions
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Trust Signal */}
                <Card className="glass-card md:col-span-2 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Secure & Trusted</h3>
                            <p className="text-xs text-slate-400">Your items are stored in our secure, insured facility.</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
