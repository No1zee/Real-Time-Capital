"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function submitRating(auctionId: string, score: number, comment: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    // Verify that the user is the winner of the auction
    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { Bid: { orderBy: { amount: "desc" }, take: 1 } }
    })

    if (!auction) throw new Error("Auction not found")

    const winnerId = auction.Bid[0]?.userId
    if (winnerId !== user.id) {
        throw new Error("Only the winner can rate this auction")
    }

    await prisma.rating.create({
        data: {
            userId: user.id,
            auctionId,
            score,
            comment,
        }
    })

    revalidatePath(`/portal/auctions/${auctionId}`)
}

export async function getAuctionRating(auctionId: string) {
    return await prisma.rating.findUnique({
        where: { auctionId },
        include: { User: { select: { name: true, image: true } } }
    })
}

export async function submitDispute(auctionId: string, reason: string, description: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    await prisma.dispute.create({
        data: {
            id: crypto.randomUUID(),
            userId: user.id,
            auctionId,
            reason,
            description,
            updatedAt: new Date()
        }
    })

    revalidatePath(`/portal/auctions/${auctionId}`)
}
