"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Percent, Activity, Scale, Eye } from "lucide-react"

interface BusinessKPIGridProps {
    data: {
        redemptionRate: number
        sellThroughRate: number
        loanBookValue: number
        avgInterest: number
        bidToViewRatio: number
        totalLoans: number
        activeLoansCount: number
    }
}

export function BusinessKPIGrid({ data }: BusinessKPIGridProps) {
    // Helper to render trend (Mocked for now as we don't have historical data snapshots yet)
    const renderTrend = (value: number, type: 'up' | 'down' | 'neutral' = 'up') => {
        const isPositive = type === 'up'
        const ColorIcon = isPositive ? TrendingUp : TrendingDown
        const colorClass = isPositive ? "text-emerald-500" : "text-rose-500"

        return (
            <div className={`flex items-center text-xs ${colorClass} font-medium`}>
                <ColorIcon className="w-3 h-3 mr-1" />
                {value}% from last month
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 1. Redemption Rate */}
            <Card className="glass-card bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-400">Redemption Rate</CardTitle>
                    <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{data.redemptionRate.toFixed(1)}%</div>
                    <p className="text-xs text-slate-400 mt-1">Loans successfully repaid</p>
                </CardContent>
            </Card>

            {/* 2. Loan Book Value */}
            <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-400">Active Loan Book</CardTitle>
                    <Scale className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{formatCurrency(data.loanBookValue)}</div>
                    <p className="text-xs text-slate-400 mt-1">{data.activeLoansCount} active agreements</p>
                </CardContent>
            </Card>

            {/* 3. Sell-Through Rate */}
            <Card className="glass-card bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-400">Sell-Through Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{data.sellThroughRate.toFixed(1)}%</div>
                    <p className="text-xs text-slate-400 mt-1">Auctions resulting in sales</p>
                </CardContent>
            </Card>

            {/* 4. Yield / Interest */}
            <Card className="glass-card bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-400">Avg. Portfolio Yield</CardTitle>
                    <Percent className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{data.avgInterest.toFixed(2)}%</div>
                    <p className="text-xs text-slate-400 mt-1">Monthly interest yield</p>
                </CardContent>
            </Card>
        </div>
    )
}
