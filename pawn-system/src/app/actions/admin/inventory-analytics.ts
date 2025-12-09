"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { DateRange } from "./revenue-reports"

export type InventoryMetrics = {
    totalItems: number
    itemsInStock: number
    itemsSold: number
    itemsInAuction: number
    turnoverRate: number
    averageDaysToSell: number
    categoryPerformance: {
        category: string
        totalItems: number
        soldItems: number
        averageSalePrice: number
        turnoverRate: number
    }[]
    slowMovingItems: {
        id: string
        name: string
        category: string
        daysInInventory: number
        valuation: number
    }[]
    valuationAccuracy: {
        category: string
        avgEstimate: number
        avgActual: number
        accuracy: number // percentage
    }[]
}

/**
 * Get comprehensive inventory analytics
 */
export async function getInventoryMetrics(range?: DateRange): Promise<InventoryMetrics> {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    const whereClause = range ? {
        createdAt: {
            gte: range.startDate,
            lte: range.endDate
        }
    } : {}

    const allItems = await prisma.item.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" }
    })

    const totalItems = allItems.length
    const itemsInStock = allItems.filter(i => i.status === "VALUED" || i.status === "PAWNED").length
    const itemsSold = allItems.filter(i => i.status === "SOLD").length
    const itemsInAuction = allItems.filter(i => i.status === "IN_AUCTION").length

    // Calculate turnover rate (items sold / total items)
    const turnoverRate = totalItems > 0 ? (itemsSold / totalItems) * 100 : 0

    // Calculate average days to sell (for sold items)
    const soldItemsWithDate = allItems.filter(i => i.status === "SOLD" && i.soldAt)
    const averageDaysToSell = soldItemsWithDate.length > 0
        ? soldItemsWithDate.reduce((sum, item) => {
            const days = Math.ceil((item.soldAt!.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            return sum + days
        }, 0) / soldItemsWithDate.length
        : 0

    // Category performance analysis
    const categories = [...new Set(allItems.map(i => i.category))]
    const categoryPerformance = categories.map(category => {
        const categoryItems = allItems.filter(i => i.category === category)
        const categorySold = categoryItems.filter(i => i.status === "SOLD")

        const averageSalePrice = categorySold.length > 0
            ? categorySold.reduce((sum, i) => sum + Number(i.salePrice || 0), 0) / categorySold.length
            : 0

        const categoryTurnover = categoryItems.length > 0
            ? (categorySold.length / categoryItems.length) * 100
            : 0

        return {
            category,
            totalItems: categoryItems.length,
            soldItems: categorySold.length,
            averageSalePrice,
            turnoverRate: categoryTurnover
        }
    }).sort((a, b) => b.turnoverRate - a.turnoverRate)

    // Slow-moving items (in inventory > 90 days, not sold)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const slowMovingItems = allItems
        .filter(i =>
            i.status !== "SOLD" &&
            i.createdAt < ninetyDaysAgo
        )
        .map(i => ({
            id: i.id,
            name: i.name,
            category: i.category,
            daysInInventory: Math.ceil((new Date().getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
            valuation: Number(i.valuation)
        }))
        .sort((a, b) => b.daysInInventory - a.daysInInventory)
        .slice(0, 10)

    // Valuation accuracy (estimated vs actual sale price)
    const valuationAccuracy = categories.map(category => {
        const categorySold = allItems.filter(i =>
            i.category === category &&
            i.status === "SOLD" &&
            i.salePrice
        )

        if (categorySold.length === 0) {
            return {
                category,
                avgEstimate: 0,
                avgActual: 0,
                accuracy: 0
            }
        }

        const avgEstimate = categorySold.reduce((sum, i) => sum + Number(i.valuation), 0) / categorySold.length
        const avgActual = categorySold.reduce((sum, i) => sum + Number(i.salePrice || 0), 0) / categorySold.length

        // Accuracy = how close actual is to estimate (100% = perfect)
        const accuracy = avgEstimate > 0
            ? Math.min(100, (avgActual / avgEstimate) * 100)
            : 0

        return {
            category,
            avgEstimate,
            avgActual,
            accuracy
        }
    }).filter(v => v.avgEstimate > 0)

    return {
        totalItems,
        itemsInStock,
        itemsSold,
        itemsInAuction,
        turnoverRate,
        averageDaysToSell,
        categoryPerformance,
        slowMovingItems,
        valuationAccuracy
    }
}

/**
 * Get inventory turnover trend over time
 */
export async function getInventoryTurnoverTrend() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Get data for last 12 months
    const monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 12)

    const items = await prisma.item.findMany({
        where: {
            createdAt: { gte: monthsAgo }
        }
    })

    // Group by month
    const monthlyData = new Map<string, { total: number; sold: number }>()

    items.forEach(item => {
        const monthKey = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`
        const current = monthlyData.get(monthKey) || { total: 0, sold: 0 }
        current.total++
        if (item.status === "SOLD") {
            current.sold++
        }
        monthlyData.set(monthKey, current)
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        turnoverRate: data.total > 0 ? (data.sold / data.total) * 100 : 0,
        itemsAdded: data.total,
        itemsSold: data.sold
    })).sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Export inventory analytics as CSV
 */
export async function exportInventoryAnalyticsToCSV(range?: DateRange): Promise<string> {
    const metrics = await getInventoryMetrics(range)

    const lines = [
        "Inventory Analytics Report",
        range ? `Period: ${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}` : "All Time",
        "",
        "Summary Metrics",
        `Total Items,${metrics.totalItems}`,
        `Items in Stock,${metrics.itemsInStock}`,
        `Items Sold,${metrics.itemsSold}`,
        `Items in Auction,${metrics.itemsInAuction}`,
        `Turnover Rate,${metrics.turnoverRate.toFixed(2)}%`,
        `Average Days to Sell,${metrics.averageDaysToSell.toFixed(0)} days`,
        "",
        "Category Performance",
        "Category,Total Items,Sold Items,Avg Sale Price,Turnover Rate"
    ]

    metrics.categoryPerformance.forEach(cat => {
        lines.push(`${cat.category},${cat.totalItems},${cat.soldItems},$${cat.averageSalePrice.toFixed(2)},${cat.turnoverRate.toFixed(2)}%`)
    })

    lines.push("")
    lines.push("Slow-Moving Items (>90 days)")
    lines.push("Item,Category,Days in Inventory,Valuation")
    metrics.slowMovingItems.forEach(item => {
        lines.push(`${item.name},${item.category},${item.daysInInventory},$${item.valuation.toFixed(2)}`)
    })

    lines.push("")
    lines.push("Valuation Accuracy by Category")
    lines.push("Category,Avg Estimate,Avg Actual,Accuracy %")
    metrics.valuationAccuracy.forEach(v => {
        lines.push(`${v.category},$${v.avgEstimate.toFixed(2)},$${v.avgActual.toFixed(2)},${v.accuracy.toFixed(2)}%`)
    })

    return lines.join('\n')
}
