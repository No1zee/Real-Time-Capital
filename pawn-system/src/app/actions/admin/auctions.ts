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
        orderBy: { startTime: "desc" },
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

    await prisma.auction.update({
        where: { id: auctionId },
        data: {
            status: "ENDED",
            endTime: new Date()
        }
    })

    revalidatePath("/admin/auctions")
}
