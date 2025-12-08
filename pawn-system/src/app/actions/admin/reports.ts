"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Helper to format date for CSV
const fmt = (d: Date) => d.toISOString().split('T')[0]

export async function getLoanBookReport() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") throw new Error("Unauthorized")

    const loans = await prisma.loan.findMany({
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" }
    })

    return loans.map(l => ({
        LoanID: l.id,
        Customer: l.customer ? `${l.customer.firstName} ${l.customer.lastName}` : "Unknown",
        Principal: l.principalAmount,
        InterestRate: l.interestRate,
        AmountDue: Number(l.principalAmount) * (1 + Number(l.interestRate) / 100),
        Status: l.status,
        DateIssued: fmt(l.createdAt),
        DueDate: fmt(l.dueDate),
        Collateral: l.items.map(i => i.name).join("; ")
    }))
}

export async function getAuctionSalesReport() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") throw new Error("Unauthorized")

    // Completed auctions (Items with status SOLD)
    // Actually, Auction table has statusENDED but doesn't store "SoldPrice". Item stores SalePrice.
    // Let's query Items that are SOLD.

    const items = await prisma.item.findMany({
        where: { status: "SOLD" },
        include: { auction: true },
        orderBy: { updatedAt: "desc" }
    })

    // Also get auctions that ENDED but item might not be marked SOLD if we missed a step.
    // But Sold Report should strictly be SOLD items.

    return items.map(i => ({
        ItemID: i.id,
        Name: i.name,
        Category: i.category,
        Valuation: i.valuation,
        SalePrice: i.salePrice,
        SoldDate: fmt(i.updatedAt),
        AuctionID: i.auction?.id || "Direct Sale"
    }))
}

export async function getUserDirectoryReport() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") throw new Error("Unauthorized")

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" }
    })

    return users.map(u => ({
        UserID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.isActive ? "Active" : "Suspended",
        Verification: u.verificationStatus,
        WalletBalance: u.walletBalance,
        JoinedDate: fmt(u.createdAt)
    }))
}
