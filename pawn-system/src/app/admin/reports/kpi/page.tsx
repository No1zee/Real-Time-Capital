
import { getBusinessKPIs } from "@/app/actions/admin/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, RefreshCcw, HandCoins, Activity, Eye, Info } from "lucide-react"

export default async function KPIDashboardPage() {
    const kpis = await getBusinessKPIs()

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-white">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
                <p className="text-muted-foreground">Key Performance Indicators for Operational Health</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Redemption Rate */}
                <Card className="glass-card border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Redemption Rate</CardTitle>
                        <RefreshCcw className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.redemptionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpis.totalLoans} Total Loans
                        </p>
                        <div className="mt-3 text-xs p-2 bg-blue-500/10 text-blue-400 rounded">
                            Target: &gt; 85% for healthy lending.
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Loan Book Value */}
                <Card className="glass-card border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Loan Book</CardTitle>
                        <HandCoins className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpis.loanBookValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From {kpis.activeLoansCount} active loans
                        </p>
                        <div className="mt-3 text-xs p-2 bg-green-500/10 text-green-400 rounded">
                            Avg Yield: {kpis.avgInterest.toFixed(1)}% (Interest Rate)
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Sell-Through Rate */}
                <Card className="glass-card border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sell-Through Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.sellThroughRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Auctions vs Sold Items
                        </p>
                        <div className="mt-3 text-xs p-2 bg-orange-500/10 text-orange-400 rounded">
                            Low STR? Check starting prices.
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Engagement (Bid/View) */}
                <Card className="glass-card border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bid-to-View Ratio</CardTitle>
                        <Eye className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.bidToViewRatio.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Bids per Item View
                        </p>
                        <div className="mt-3 text-xs p-2 bg-purple-500/10 text-purple-400 rounded">
                            Measures item desirability.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Explanation Section */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5 text-indigo-400" />
                        Understanding these Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm text-slate-400">
                    <div className="grid grid-cols-[1fr_3fr] gap-4 pb-4 border-b border-white/10">
                        <span className="font-semibold text-white">Redemption Rate</span>
                        <span>Indicates the quality of your loan customers. High redemption means customers value their items and pay back loans, generating reliable interest income.</span>
                    </div>
                    <div className="grid grid-cols-[1fr_3fr] gap-4 pb-4 border-b border-white/10">
                        <span className="font-semibold text-white">Active Loan Book</span>
                        <span>Total principal amount currently lent out. This represents your financial exposure and potential interest revenue base.</span>
                    </div>
                    <div className="grid grid-cols-[1fr_3fr] gap-4 pb-4 border-b border-white/10">
                        <span className="font-semibold text-white">Sell-Through Rate</span>
                        <span>Percentage of auctioned items that actually sell. A low rate suggests items are priced too high or not attractive to your bidder base.</span>
                    </div>
                    <div className="grid grid-cols-[1fr_3fr] gap-4">
                        <span className="font-semibold text-white">Bid-to-View Ratio</span>
                        <span>Measures how "hot" your inventory is. If people view but don't bid, the price or presentation might be wrong.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
