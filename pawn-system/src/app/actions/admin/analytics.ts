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
