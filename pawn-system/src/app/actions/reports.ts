"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { formatCurrency } from "@/lib/utils"

export async function getFinancialStats() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // 1. Loan Stats
    const loans = await prisma.loan.findMany({
        select: {
            principalAmount: true,
            interestRate: true,
            status: true
        }
    })

    const totalPrincipal = loans.reduce((sum, loan) => sum + Number(loan.principalAmount), 0)

    // Simple interest calculation for estimation
    const totalInterestExpected = loans.reduce((sum, loan) => {
        return sum + (Number(loan.principalAmount) * Number(loan.interestRate) / 100)
    }, 0)

    // 2. Payment Stats
    const payments = await prisma.payment.aggregate({
        _sum: {
            amount: true
        }
    })
    const totalRepaid = Number(payments._sum.amount || 0)

    // 3. Auction Revenue (Completed Auctions)
    const auctions = await prisma.auction.findMany({
        where: {
            status: "ENDED", // Assuming ENDED means sold/completed
            currentBid: { not: null }
        },
        select: {
            currentBid: true
        }
    })
    const totalAuctionRevenue = auctions.reduce((sum, auction) => sum + Number(auction.currentBid || 0), 0)

    return {
        totalPrincipal,
        totalInterestExpected,
        totalRepaid,
        totalAuctionRevenue,
        outstandingBalance: (totalPrincipal + totalInterestExpected) - totalRepaid
    }
}

export async function getInventoryStats() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const items = await prisma.item.findMany({
        select: {
            status: true,
            valuation: true
        }
    })

    const totalValuation = items.reduce((sum, item) => sum + Number(item.valuation), 0)

    const statusCounts = items.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return {
        totalItems: items.length,
        totalValuation,
        statusCounts
    }
}

export async function getRecentActivity() {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Fetch latest 5 from each category
    const [loans, payments, auctions] = await Promise.all([
        prisma.loan.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: true }
        }),
        prisma.payment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { loan: { include: { customer: true } } }
        }),
        prisma.auction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { item: true }
        })
    ])

    // Combine and sort
    const activity = [
        ...loans.map(l => ({
            type: 'LOAN_CREATED',
            date: l.createdAt,
            description: `Loan created for ${l.customer.firstName} ${l.customer.lastName}`,
            amount: Number(l.principalAmount),
            id: l.id
        })),
        ...payments.map(p => ({
            type: 'PAYMENT_RECEIVED',
            date: p.createdAt,
            description: `Payment from ${p.loan.customer.firstName} ${p.loan.customer.lastName}`,
            amount: Number(p.amount),
            id: p.id
        })),
        ...auctions.map(a => ({
            type: 'AUCTION_STARTED',
            date: a.createdAt,
            description: `Auction started for ${a.item.name}`,
            amount: Number(a.startPrice),
            id: a.id
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return activity
}
