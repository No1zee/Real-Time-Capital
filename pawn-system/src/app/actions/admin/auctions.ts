"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { AuctionType } from "@prisma/client"
import { z } from "zod"

const createAuctionSchema = z.object({
    itemId: z.string(),
    startPrice: z.coerce.number().min(1),
    reservePrice: z.coerce.number().optional(),
    durationDays: z.coerce.number().min(1).max(30),
    type: z.enum(["ONLINE", "LIVE", "SEALED"])
})

export async function getAuctionableItems() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return []

    // Logic: Items that are PAWNED? Or DEFAULTED loans? 
    // BRS: "System to automatically transfer a defaulted linked asset to auction"
    // For now, let's fetch items with status 'PAWNED' or 'DEFAULTED' (if status existed on Item, but ItemStatus has IN_AUCTION)
    // Actually, ItemStatus has 'PAWNED'. We can manually move them.
    // Let's assume we can auction anything that is 'PAWNED' or 'VALUED' (for direct sale assets).

    return await db.item.findMany({
        where: {
            status: { in: ["PAWNED", "VALUED"] },
            Auction: { is: null } // Not already in an auction
        },
        select: { id: true, name: true, category: true, finalValuation: true, images: true }
    })
}

export async function createAuction(formData: FormData) {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { success: false, message: "Unauthorized" }
    }

    const rawData = {
        itemId: formData.get("itemId"),
        startPrice: formData.get("startPrice"),
        reservePrice: formData.get("reservePrice"),
        durationDays: formData.get("durationDays"),
        type: formData.get("type")
    }

    const validated = createAuctionSchema.safeParse(rawData)

    if (!validated.success) {
        return { success: false, message: "Invalid input" }
    }

    const { itemId, startPrice, reservePrice, durationDays, type } = validated.data

    const startTime = new Date()
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + durationDays)

    try {
        await db.$transaction(async (tx) => {
            // 1. Create Auction
            await tx.auction.create({
                data: {
                    itemId,
                    startPrice: startPrice,
                    currentBid: startPrice, // Start bid is the base
                    reservePrice: reservePrice || undefined,
                    startTime,
                    endTime,
                    type: type as any, // Cast for stale client type
                    status: "ACTIVE"
                }
            })

            // 2. Update Item Status
            await tx.item.update({
                where: { id: itemId },
                data: { status: "IN_AUCTION" }
            })
        })

        revalidatePath("/admin/auctions")
        revalidatePath("/portal/auctions")
        return { success: true, message: "Auction created successfully" }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to create auction" }
    }
}

export async function getAllAuctionsAdmin() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return []

    return await db.auction.findMany({
        orderBy: { startTime: 'desc' },
        include: {
            Item: {
                select: { name: true, category: true, images: true }
            },
            _count: {
                select: { Bid: true }
            }
        }
    })
}

export async function cancelAuction(auctionId: string) {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await db.$transaction(async (tx) => {
            const auction = await tx.auction.findUnique({ where: { id: auctionId } })
            if (!auction) throw new Error("Auction not found")

            // Update Auction
            await tx.auction.update({
                where: { id: auctionId },
                data: { status: "CANCELLED" }
            })

            // Return Item to Stock (or PAWNED state)
            await tx.item.update({
                where: { id: auction.itemId },
                data: { status: "PAWNED" } // Revert to pawned so it can be redeemed or re-auctioned
            })
        })

        revalidatePath("/admin/auctions")
        return { success: true, message: "Auction cancelled" }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to cancel auction" }
    }
}

export async function forceEndAuction(auctionId: string) {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        // In a real scenario, this should trigger the "End Auction" workflow (winner determination)
        // For MVP, we'll just mark it ENDED.
        await db.auction.update({
            where: { id: auctionId },
            data: { status: "ENDED", endTime: new Date() } // Set end time to now
        })

        revalidatePath("/admin/auctions")
        revalidatePath("/portal/auctions")
        return { success: true, message: "Auction ended forcefully" }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to end auction" }
    }
}
