"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAllItemsAdmin() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    return await prisma.item.findMany({
        include: {
            loan: {
                include: { customer: true, user: true }
            },
            auction: true
        },
        orderBy: { createdAt: "desc" }
    })
}

export async function markItemDefaulted(itemId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // When an item is defaulted, we move it to "PAWNED" (ready for auction) 
    // AND mark the loan as "DEFAULTED"
    // Wait, if it's "PAWNED", it means it's held collateral.
    // If it defaults, it should stay "PAWNED" but be flagged, OR move to "PENDING_AUCTION" (if that enum existed).
    // Let's stick to: Map ItemStatus.PAWNED -> but update LoanStatus.DEFAULTED.
    // Actually, usually "Defaulted" means the shop now fully owns it and can sell it.

    // We will update the LOAN status to DEFAULTED.
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item?.loanId) throw new Error("Item is not associated with a loan")

    await prisma.loan.update({
        where: { id: item.loanId },
        data: { status: "DEFAULTED" }
    })

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/loans")
}

export async function moveItemToAuction(itemId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Check if valid transition
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item) throw new Error("Item not found")
    if (item.status === "SOLD") throw new Error("Cannot auction sold item")
    if (item.status === "IN_AUCTION") throw new Error("Already in auction")

    // Create a draft auction? Or just change status?
    // Changing status to IN_AUCTION requires an Auction record usually.
    // For now, we'll just set the status so it appears in the "Create Auction" picker,
    // OR creates a dummy scheduled auction.

    // Simplest: Just set status to IN_AUCTION. 
    // The "Create Auction" page filters by status.
    // Actually, createAuction typically takes an item. 
    // Let's just create a SCHEDULED auction for it automatically.

    // Default 7 day auction starting tomorrow
    const startTime = new Date()
    startTime.setDate(startTime.getDate() + 1)
    const endTime = new Date(startTime)
    endTime.setDate(endTime.getDate() + 7)

    await prisma.$transaction([
        prisma.item.update({
            where: { id: itemId },
            data: { status: "IN_AUCTION" }
        }),
        prisma.auction.create({
            data: {
                itemId,
                startPrice: item.valuation, // Default start price
                startTime,
                endTime,
                status: "SCHEDULED"
            }
        })
    ])

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/auctions")
}
