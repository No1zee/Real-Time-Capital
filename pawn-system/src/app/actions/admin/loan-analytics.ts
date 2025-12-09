"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { DateRange } from "./revenue-reports"

export type LoanPerformanceMetrics = {
    totalLoans: number
    activeLoans: number
    completedLoans: number
    defaultedLoans: number
    defaultRate: number
    averageLoanSize: number
    averageDuration: number
    totalInterestEarned: number
    repaymentRate: number
    riskDistribution: { category: string; count: number }[]
}

/**
 * Get comprehensive loan performance metrics
 */
export async function getLoanPerformanceMetrics(range?: DateRange): Promise<LoanPerformanceMetrics> {
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

    const loans = await prisma.loan.findMany({
        where: whereClause,
        include: {
            Payment: true
        }
    })

    const totalLoans = loans.length
    const activeLoans = loans.filter(l => l.status === "ACTIVE").length
    const completedLoans = loans.filter(l => l.status === "COMPLETED").length
    const defaultedLoans = loans.filter(l => l.status === "DEFAULTED").length

    const defaultRate = totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0

    const averageLoanSize = totalLoans > 0
        ? loans.reduce((sum, l) => sum + Number(l.principalAmount), 0) / totalLoans
        : 0

    const averageDuration = totalLoans > 0
        ? loans.reduce((sum, l) => sum + l.durationDays, 0) / totalLoans
        : 0

    // Calculate total interest earned (from completed and active loans)
    const totalInterestEarned = loans.reduce((sum, loan) => {
        const principal = Number(loan.principalAmount)
        const rate = Number(loan.interestRate)
        return sum + (principal * rate / 100)
    }, 0)

    // Repayment rate (percentage of loans paid on or before due date)
    const onTimeLoans = loans.filter(l => {
        if (l.status !== "COMPLETED") return false
        // Check if any payment was made on or before due date
        const hasOnTimePayment = l.Payment.some(p => p.createdAt <= l.dueDate)
        return hasOnTimePayment
    }).length

    const repaymentRate = completedLoans > 0 ? (onTimeLoans / completedLoans) * 100 : 0

    // Risk distribution (by loan size)
    const riskCategories = [
        { min: 0, max: 100, label: "Low Risk (<$100)" },
        { min: 100, max: 500, label: "Medium Risk ($100-$500)" },
        { min: 500, max: Infinity, label: "High Risk (>$500)" }
    ]

    const riskDistribution = riskCategories.map(cat => ({
        category: cat.label,
        count: loans.filter(l => {
            const amount = Number(l.principalAmount)
            return amount >= cat.min && amount < cat.max
        }).length
    }))

    return {
        totalLoans,
        activeLoans,
        completedLoans,
        defaultedLoans,
        defaultRate,
        averageLoanSize,
        averageDuration,
        totalInterestEarned,
        repaymentRate,
        riskDistribution
    }
}

/**
 * Get default rate analysis over time
 */
export async function getDefaultRateAnalysis() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Get loans by month for the last 12 months
    const monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 12)

    const loans = await prisma.loan.findMany({
        where: {
            createdAt: { gte: monthsAgo }
        },
        orderBy: { createdAt: "asc" }
    })

    // Group by month
    const monthlyData = new Map<string, { total: number; defaulted: number }>()

    loans.forEach(loan => {
        const monthKey = `${loan.createdAt.getFullYear()}-${String(loan.createdAt.getMonth() + 1).padStart(2, '0')}`
        const current = monthlyData.get(monthKey) || { total: 0, defaulted: 0 }
        current.total++
        if (loan.status === "DEFAULTED") {
            current.defaulted++
        }
        monthlyData.set(monthKey, current)
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        defaultRate: data.total > 0 ? (data.defaulted / data.total) * 100 : 0,
        totalLoans: data.total
    }))
}

/**
 * Export loan analytics as CSV
 */
export async function exportLoanAnalyticsToCSV(range?: DateRange): Promise<string> {
    const metrics = await getLoanPerformanceMetrics(range)

    const lines = [
        "Loan Performance Report",
        range ? `Period: ${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}` : "All Time",
        "",
        "Summary Metrics",
        `Total Loans,${metrics.totalLoans}`,
        `Active Loans,${metrics.activeLoans}`,
        `Completed Loans,${metrics.completedLoans}`,
        `Defaulted Loans,${metrics.defaultedLoans}`,
        `Default Rate,${metrics.defaultRate.toFixed(2)}%`,
        `Average Loan Size,$${metrics.averageLoanSize.toFixed(2)}`,
        `Average Duration,${metrics.averageDuration.toFixed(0)} days`,
        `Total Interest Earned,$${metrics.totalInterestEarned.toFixed(2)}`,
        `On-Time Repayment Rate,${metrics.repaymentRate.toFixed(2)}%`,
        "",
        "Risk Distribution",
        "Category,Count"
    ]

    metrics.riskDistribution.forEach(({ category, count }) => {
        lines.push(`${category},${count}`)
    })

    return lines.join('\n')
}
