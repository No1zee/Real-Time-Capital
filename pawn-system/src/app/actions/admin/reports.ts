"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Helper to format date for CSV
const fmt = (d: Date) => d.toISOString().split('T')[0]

export async function getLoanBookReport() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") throw new Error("Unauthorized")

    const loans = await prisma.loan.findMany({
        include: { Customer: true, Item: true },
        orderBy: { createdAt: "desc" }
    })

    return loans.map(l => ({
        LoanID: l.id,
        Customer: l.Customer ? `${l.Customer.firstName} ${l.Customer.lastName}` : "Unknown",
        Principal: l.principalAmount,
        InterestRate: l.interestRate,
        AmountDue: Number(l.principalAmount) * (1 + Number(l.interestRate) / 100),
        Status: l.status,
        DateIssued: fmt(l.createdAt),
        DueDate: fmt(l.dueDate),
        Collateral: l.Item.map(i => i.name).join("; ")
    }))
}

export async function getAuctionSalesReport() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") throw new Error("Unauthorized")

    // Completed auctions (Items with status SOLD)
    const items = await prisma.item.findMany({
        where: { status: "SOLD" },
        include: { Auction: true },
        orderBy: { updatedAt: "desc" }
    })

    return items.map(i => ({
        ItemID: i.id,
        Name: i.name,
        Category: i.category,
        Valuation: i.valuation,
        SalePrice: i.salePrice,
        SoldDate: fmt(i.updatedAt),
        AuctionID: i.Auction?.id || "Direct Sale"
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
