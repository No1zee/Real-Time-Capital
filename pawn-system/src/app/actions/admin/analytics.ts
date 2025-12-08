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

export async function logActivity(type: string, metadata?: any) {
    const session = await auth()
    if (!session?.user?.id) return // Silent fail if not logged in

    try {
        await prisma.userActivity.create({
            data: {
                userId: session.user.id,
                type,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        })
    } catch (error) {
        console.error("Failed to log activity:", error)
    }
}

export async function getUserCRMStats(userId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // 1. Visit Frequency (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const visits = await prisma.userActivity.count({
        where: {
            userId,
            type: "LOGIN",
            createdAt: { gte: thirtyDaysAgo }
        }
    })

    const lastActive = await prisma.userActivity.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
    })

    // 2. Preferences (Interest Categories)
    // Combine Watchlist + Bids
    const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        include: { auction: { include: { item: true } } }
    })

    const bids = await prisma.bid.findMany({
        where: { userId },
        include: { auction: { include: { item: true } } }
    })

    const categoryMap = new Map<string, number>()
    const addToMap = (category: string) => {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    }

    watchlist.forEach(w => addToMap(w.auction.item.category))
    bids.forEach(b => addToMap(b.auction.item.category))

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
