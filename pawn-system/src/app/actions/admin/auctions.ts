"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAllAuctionsAdmin() {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF")) {
        throw new Error("Unauthorized")
    }

    return await prisma.auction.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            item: true,
            _count: {
                select: { bids: true }
            }
        }
    })
}

export async function cancelAuction(auctionId: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can cancel auctions")
    }

    // When cancelling, we might want to refund bids?
    // For now, let's just set status to CANCELLED.
    // In a real system, we'd trigger a refund process.

    await prisma.auction.update({
        where: { id: auctionId },
        data: { status: "CANCELLED" }
    })

    revalidatePath("/admin/auctions")
}

export async function forceEndAuction(auctionId: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can force end auctions")
    }

    // Set end time to now, effectively ending it.
    // Or set status to ENDED immediately? 
    // If we set status to ENDED, the cron/check logic might skip processing the winner.
    // Better to set endTime to now() and let the standard process pick it up, 
    // OR process verification inline (complex).
    // Let's manually set status to ENDED for now.

    await prisma.auction.update({
        where: { id: auctionId },
        data: {
            status: "ENDED",
            endTime: new Date()
        }
    })

    revalidatePath("/admin/auctions")
}
