"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export type DateRange = {
    startDate: Date
    endDate: Date
}

export type RevenueReport = {
    totalRevenue: number
    revenueBySource: { source: string; amount: number }[]
    dailyRevenue: { date: string; amount: number }[]
    growth: { percentage: number; trend: "up" | "down" | "stable" }
    topCategories: { category: string; revenue: number }[]
}

/**
 * Get comprehensive revenue report for a date range
 */
export async function getRevenueReport(range: DateRange): Promise<RevenueReport> {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    const { startDate, endDate } = range

    // Get all completed transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            status: "COMPLETED",
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { createdAt: "asc" }
    })

    // Calculate total revenue
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Revenue by source (transaction type)
    const sourceMap = new Map<string, number>()
    transactions.forEach(t => {
        const current = sourceMap.get(t.type) || 0
        sourceMap.set(t.type, current + Number(t.amount))
    })
    const revenueBySource = Array.from(sourceMap.entries()).map(([source, amount]) => ({
        source,
        amount
    }))

    // Daily revenue breakdown
    const dailyMap = new Map<string, number>()
    transactions.forEach(t => {
        const dateKey = t.createdAt.toISOString().split('T')[0]
        const current = dailyMap.get(dateKey) || 0
        dailyMap.set(dateKey, current + Number(t.amount))
    })
    const dailyRevenue = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate growth (compare to previous period)
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - periodDays)

    const previousTransactions = await prisma.transaction.findMany({
        where: {
            status: "COMPLETED",
            createdAt: {
                gte: previousStart,
                lt: startDate
            }
        }
    })

    const previousRevenue = previousTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const growthPercentage = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 100

    const growth = {
        percentage: Math.abs(growthPercentage),
        trend: (growthPercentage > 5 ? "up" : growthPercentage < -5 ? "down" : "stable") as "up" | "down" | "stable"
    }

    // Top revenue categories (from sold items)
    const soldItems = await prisma.item.findMany({
        where: {
            status: "SOLD",
            soldAt: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            category: true,
            salePrice: true
        }
    })

    const categoryMap = new Map<string, number>()
    soldItems.forEach(item => {
        if (item.salePrice) {
            const current = categoryMap.get(item.category) || 0
            categoryMap.set(item.category, current + Number(item.salePrice))
        }
    })
    const topCategories = Array.from(categoryMap.entries())
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    return {
        totalRevenue,
        revenueBySource,
        dailyRevenue,
        growth,
        topCategories
    }
}

/**
 * Get revenue by time period
 */
export async function getRevenueByPeriod(
    period: "daily" | "weekly" | "monthly",
    months: number = 12
) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const transactions = await prisma.transaction.findMany({
        where: {
            status: "COMPLETED",
            createdAt: { gte: startDate }
        },
        orderBy: { createdAt: "asc" }
    })

    // Group by period
    const periodMap = new Map<string, number>()

    transactions.forEach(t => {
        let key: string
        const date = t.createdAt

        if (period === "daily") {
            key = date.toISOString().split('T')[0]
        } else if (period === "weekly") {
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = weekStart.toISOString().split('T')[0]
        } else {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }

        const current = periodMap.get(key) || 0
        periodMap.set(key, current + Number(t.amount))
    })

    return Array.from(periodMap.entries())
        .map(([period, revenue]) => ({ period, revenue }))
        .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Export revenue data as CSV
 */
export async function exportRevenueToCSV(range: DateRange): Promise<string> {
    const report = await getRevenueReport(range)

    const lines = [
        "Revenue Report",
        `Period: ${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`,
        "",
        "Summary",
        `Total Revenue,$${report.totalRevenue.toFixed(2)}`,
        `Growth,${report.growth.percentage.toFixed(1)}% ${report.growth.trend}`,
        "",
        "Daily Breakdown",
        "Date,Amount"
    ]

    report.dailyRevenue.forEach(({ date, amount }) => {
        lines.push(`${date},$${amount.toFixed(2)}`)
    })

    lines.push("")
    lines.push("Revenue by Source")
    lines.push("Source,Amount")
    report.revenueBySource.forEach(({ source, amount }) => {
        lines.push(`${source},$${amount.toFixed(2)}`)
    })

    lines.push("")
    lines.push("Top Categories")
    lines.push("Category,Revenue")
    report.topCategories.forEach(({ category, revenue }) => {
        lines.push(`${category},$${revenue.toFixed(2)}`)
    })

    return lines.join('\n')
}
