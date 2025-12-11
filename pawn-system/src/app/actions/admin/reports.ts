"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

// 1. Inventory Reports
// Asset Valuation Report: Total value of assets by type and condition
export async function getInventoryValuationStats() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { error: "Unauthorized" }
    }

    // Group by Category (AssetType)
    // We cast the _sum input to 'any' to bypass stale Prisma client types for finalValuation
    // We cast the result to 'any[]' to ensure the return type allows accessing these fields
    const valuationByCategory = await db.item.groupBy({
        by: ['category'],
        _sum: {
            finalValuation: true,
            marketValue: true
        } as any,
        _count: {
            id: true
        }
    }) as any[]

    // Group by Status
    const statusDistribution = await db.item.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    })

    return {
        valuationByCategory,
        statusDistribution
    }
}

// 2. Loan Reports
// Active Loans Summary
export async function getLoanStats() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { error: "Unauthorized" }
    }

    // Active Loans
    // Cast result to 'any' because Prisma client doesn't know about storageFee being summable yet
    const activeLoans = await db.loan.aggregate({
        where: { status: 'ACTIVE' },
        _sum: {
            principalAmount: true,
            storageFee: true,
        } as any,
        _count: {
            id: true
        }
    }) as any

    // Overdue Loans
    const overdueLoans = await db.loan.count({
        where: {
            status: 'ACTIVE',
            dueDate: { lt: new Date() }
        }
    })

    // Loan Performance: Default Rate (Defaulted / Total Completed+Defaulted)
    const completedCount = await db.loan.count({ where: { status: 'COMPLETED' } })
    const defaultedCount = await db.loan.count({ where: { status: 'DEFAULTED' } })

    return {
        activeLoans, // typed as any here, but structure matches ReportsDashboard expectation
        overdueLoans,
        performance: {
            completed: completedCount,
            defaulted: defaultedCount,
            total: completedCount + defaultedCount
        }
    }
}

// 3. Financial Reports
// Cash Flow (Payments received over last 30 days)
export async function getRecentCashFlow() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { error: "Unauthorized" }
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const payments = await db.payment.groupBy({
        by: ['date'],
        where: {
            date: { gte: thirtyDaysAgo }
        },
        _sum: {
            amount: true
        },
        orderBy: {
            date: 'asc'
        }
    })

    // Group by day for chart
    return payments.map(p => ({
        date: p.date.toISOString().split('T')[0],
        amount: p._sum.amount ? p._sum.amount.toNumber() : 0
    }))
}

// 4. Exceptions Report
export async function getExceptionTransactions() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return []
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const exceptions = await db.transaction.findMany({
        where: {
            OR: [
                { status: 'FAILED' },
                { status: 'PENDING', createdAt: { lt: twentyFourHoursAgo } }
            ]
        },
        include: {
            User: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    return exceptions
}
