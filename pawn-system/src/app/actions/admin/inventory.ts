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
            loan: true,
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
                status: "SCHEDULED",
                updatedAt: new Date()
            }
        })
    ])

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/auctions")
}
