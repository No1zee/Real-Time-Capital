"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getRevenueData() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Aggregate payments by day for the last 7 days
    // Prisma grouping by date is tricky with different DBs (Postgres vs SQLite).
    // Raw query is safer for date truncation, but Prisma has groupBy.
    // However, for small datasets, fetching last 30 days and reducing in JS is fine and DB-agnostic.

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const transactions = await prisma.transaction.findMany({
        where: {
            type: "PAYMENT",
            status: "COMPLETED",
            createdAt: { gte: sevenDaysAgo }
        },
        orderBy: { createdAt: "asc" }
    })

    // Group by Date "Mon", "Tue" etc
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dataMap = new Map<string, number>()

    // Initialize map for last 7 days to ensure 0 values exist
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = days[d.getDay()]
        dataMap.set(label, 0)
    }

    transactions.forEach(t => {
        const label = days[t.createdAt.getDay()]
        const amount = Number(t.amount)
        dataMap.set(label, (dataMap.get(label) || 0) + amount)
    })

    return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }))
}

export async function getUserGrowthData() {
    // Similar logic for user signups
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const users = await prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "asc" }
    })

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dataMap = new Map<string, number>()

    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = days[d.getDay()]
        dataMap.set(label, 0)
    }

    users.forEach(u => {
        const label = days[u.createdAt.getDay()]
        dataMap.set(label, (dataMap.get(label) || 0) + 1)
    })

    return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }))
}

// CRM & User Intelligence

import { logAudit } from "@/lib/logger"

export async function logActivity(type: string, metadata?: any) {
    const session = await auth()
    if (!session?.user?.id) return

    await logAudit({
        userId: session.user.id,
        action: type as any, // Temporary cast until strict typing propagates
        entityType: "SYSTEM",
        details: metadata
    })
}

export async function getUserCRMStats(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // 1. Visit Frequency (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const visits = await prisma.auditLog.count({
        where: {
            userId,
            action: "LOGIN",
            createdAt: { gte: thirtyDaysAgo }
        }
    })

    const lastActive = await prisma.auditLog.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
    })

    // 2. Preferences (Interest Categories)
    // Combine Watchlist + Bids
    const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        include: { Auction: { include: { Item: true } } }
    })

    const bids = await prisma.bid.findMany({
        where: { userId },
        include: { Auction: { include: { Item: true } } }
    })

    const categoryMap = new Map<string, number>()
    const addToMap = (category: string) => {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    }

    watchlist.forEach(w => addToMap(w.Auction.Item.category))
    bids.forEach(b => addToMap(b.Auction.Item.category))

    const interests = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Top interests first

    // 3. Total Spend & Purchase History
    const purchases = await prisma.transaction.findMany({
        where: {
            userId,
            type: "PAYMENT",
            status: "COMPLETED"
        },
        orderBy: { createdAt: "desc" }
    })

    const totalSpend = purchases.reduce((sum, p) => sum + Number(p.amount), 0)

    return {
        visitsLast30Days: visits,
        lastActive: lastActive?.createdAt || null,
        interests,
        totalSpend,
        purchaseCount: purchases.length,
        recentPurchases: purchases.slice(0, 5)
    }
}

export async function getBusinessKPIs() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // 1. Redemption Rate (Loan Health)
    const totalLoans = await prisma.loan.count()
    const completedLoans = await prisma.loan.count({ where: { status: "COMPLETED" } })
    const redemptionRate = totalLoans > 0 ? (completedLoans / totalLoans) * 100 : 0

    // 2. Sell-Through Rate (Auction Efficiency)
    const endedAuctions = await prisma.auction.count({ where: { status: "ENDED", isPractice: false } })
    const soldItems = await prisma.item.count({ where: { status: "SOLD" } })
    // Proxy: Assuming sold items are mostly via auction in this context
    const sellThroughRate = endedAuctions > 0 ? (soldItems / endedAuctions) * 100 : 0

    // 3. Active Loan Book Value (Financial Exposure)
    const activeLoans = await prisma.loan.findMany({
        where: { status: "ACTIVE" },
        select: { principalAmount: true, interestRate: true }
    })
    const loanBookValue = activeLoans.reduce((sum, loan) => sum + Number(loan.principalAmount), 0)

    // 4. Yield (Approximate Annualized Return based on Active Loans interest based on principal)
    // Actually simpler: Average Interest Rate of active portfolio
    const avgInterest = activeLoans.length > 0
        ? activeLoans.reduce((sum, loan) => sum + Number(loan.interestRate), 0) / activeLoans.length
        : 0

    // 5. Bid-to-View Ratio (Engagement)
    const totalBids = await prisma.bid.count()
    // Approximation: Count "VIEW_SENSITIVE" or "VIEW_ITEM" if we were logging it. 
    // Since we just started logging, this might be 0.
    const totalViews = await prisma.auditLog.count({ where: { action: "VIEW_ITEM" } })
    const bidToViewRatio = totalViews > 0 ? (totalBids / totalViews) : 0

    return {
        redemptionRate,
        sellThroughRate,
        loanBookValue,
        avgInterest,
        bidToViewRatio,
        totalLoans,
        activeLoansCount: activeLoans.length
    }
}
