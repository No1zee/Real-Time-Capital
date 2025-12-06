"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"
import { redirect } from "next/navigation"

export async function createAuction(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "STAFF" && session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const itemId = formData.get("itemId") as string
    const startPrice = Number(formData.get("startPrice"))
    const startTime = new Date(formData.get("startTime") as string)
    const endTime = new Date(formData.get("endTime") as string)

    if (!itemId || !startPrice || !startTime || !endTime) {
        throw new Error("Missing fields")
    }

    await prisma.auction.create({
        data: {
            itemId,
            startPrice,
            startTime,
            endTime,
            status: "SCHEDULED",
        },
    })

    await prisma.item.update({
        where: { id: itemId },
        data: { status: "AUCTION" },
    })

    revalidatePath("/auctions")
    redirect("/auctions")
}

export async function placeBid(auctionId: string, amount: number) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
    })

    if (!auction) throw new Error("Auction not found")

    // Simple status check, can be enhanced with time checks
    const now = new Date()
    if (now < auction.startTime) throw new Error("Auction has not started")
    if (now > auction.endTime) throw new Error("Auction has ended")

    const currentPrice = Number(auction.currentBid || auction.startPrice)
    const minBid = currentPrice + 2

    if (amount < minBid) {
        throw new Error(`Bid must be at least ${minBid}`)
    }

    // Check Balance (Practice vs Real)
    if (auction.isPractice) {
        if (Number(user.practiceBalance) < amount) {
            throw new Error("Insufficient practice funds")
        }
    } else {
        if (Number(user.walletBalance) < amount) {
            throw new Error("Insufficient funds in wallet")
        }
    }

    // Get previous highest bidder for notification
    const previousHighestBid = await prisma.bid.findFirst({
        where: { auctionId },
        orderBy: { amount: "desc" },
        include: { user: true }
    })

    // Place the bid
    await prisma.$transaction([
        prisma.bid.create({
            data: {
                amount,
                userId: user.id,
                auctionId,
            },
        }),
        prisma.auction.update({
            where: { id: auctionId },
            data: { currentBid: amount },
        }),
    ])

    // Notify previous winner
    if (previousHighestBid && previousHighestBid.userId !== user.id) {
        await createNotification(
            previousHighestBid.userId,
            "OUTBID",
            `You have been outbid! ${user.name || "Someone"} placed a bid of ${amount}.`,
            auctionId
        )
    }

    // Trigger Auto-Bidder
    await processAutoBids(auctionId)

    revalidatePath(`/portal/auctions/${auctionId}`)
    revalidatePath(`/portal/auctions`)
}

export async function setAutoBid(auctionId: string, maxAmount: number) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    await prisma.autoBid.upsert({
        where: {
            userId_auctionId: {
                userId: user.id,
                auctionId,
            },
        },
        update: { maxAmount },
        create: {
            userId: user.id,
            auctionId,
            maxAmount,
        },
    })

    // Trigger Auto-Bidder immediately in case this new max bid changes the winner
    await processAutoBids(auctionId)

    revalidatePath(`/portal/auctions/${auctionId}`)
}

async function processAutoBids(auctionId: string) {
    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
            bids: {
                orderBy: { amount: "desc" },
                take: 1,
            },
            autoBids: {
                orderBy: { maxAmount: "desc" },
            },
        },
    })

    if (!auction) return

    const currentBid = Number(auction.currentBid || auction.startPrice)
    const currentWinnerId = auction.bids[0]?.userId
    const autoBids = auction.autoBids

    if (autoBids.length === 0) return

    // Filter out auto-bids that can't afford the current price + increment
    // Minimum increment
    const increment = 2

    // Determine the highest potential bidder
    // We need to compare the current winner (who might not have an auto-bid but has a manual bid)
    // vs the auto-bidders.

    // Actually, simpler logic:
    // 1. Identify the highest AutoBidder.
    // 2. If HighestAutoBidder is NOT the current winner:
    //    - Check if they can beat the current price.
    //    - Calculate the price needed to beat the SECOND highest competitor (Auto or Manual).

    const highestAuto = autoBids[0]
    const secondHighestAuto = autoBids[1]

    // If the highest auto-bidder is already winning, we might still need to bump the price 
    // if the second highest auto-bid is higher than current price.

    if (highestAuto.userId === currentWinnerId) {
        // Already winning. Check if we need to defend against the second highest auto-bid.
        if (secondHighestAuto) {
            const priceToDefend = Number(secondHighestAuto.maxAmount) + increment
            if (priceToDefend > currentBid && priceToDefend <= Number(highestAuto.maxAmount)) {
                await placeSystemBid(auctionId, highestAuto.userId, priceToDefend)
            }
        }
        return
    }

    // If highest auto-bidder is NOT winning
    if (Number(highestAuto.maxAmount) > currentBid) {
        // Calculate bid amount
        // It should be max(currentBid, secondHighestAuto.maxAmount) + increment
        const constraint = secondHighestAuto ? Number(secondHighestAuto.maxAmount) : 0
        const base = Math.max(currentBid, constraint)
        let newBid = base + increment

        // Cap at max amount
        if (newBid > Number(highestAuto.maxAmount)) {
            newBid = Number(highestAuto.maxAmount)
        }

        // Ensure newBid is actually higher than currentBid (it should be, unless maxAmount is too low)
        if (newBid > currentBid) {
            await placeSystemBid(auctionId, highestAuto.userId, newBid)

            // Recursively check again? 
            // If we just outbid someone, and they have an auto-bid that was skipped?
            // No, because we sorted by maxAmount, so highestAuto is the strongest.
            // The only case is if the current winner has a higher manual bid?
            // But we checked `highestAuto.maxAmount > currentBid`.
            // So highestAuto wins.
        }
    }
}

async function placeSystemBid(auctionId: string, userId: string, amount: number) {
    await prisma.$transaction([
        prisma.bid.create({
            data: {
                auctionId,
                userId,
                amount,
            },
        }),
        prisma.auction.update({
            where: { id: auctionId },
            data: { currentBid: amount, status: "ACTIVE" },
        }),
    ])
}

export async function getAuctions(role: "STAFF" | "CUSTOMER" = "CUSTOMER") {
    const now = new Date()

    if (role === "STAFF") {
        return await prisma.auction.findMany({
            include: { item: true, bids: true },
            orderBy: { createdAt: "desc" },
        })
    }

    // For customers, show Active and Scheduled (maybe)
    return await prisma.auction.findMany({
        where: {
            OR: [
                { status: "ACTIVE" },
                { status: "SCHEDULED" }
            ]
        },
        include: { item: true, _count: { select: { bids: true } } },
        orderBy: { endTime: "asc" },
    })
}

export async function getAuction(id: string) {
    return await prisma.auction.findUnique({
        where: { id },
        include: {
            item: true,
            bids: {
                include: { user: { select: { name: true } } },
                orderBy: { amount: "desc" }
            },
            autoBids: {
                where: { userId: (await auth())?.user?.id }, // Only fetch MY auto-bid
            }
        }
    })
}

export async function getUnredeemedItems() {
    return await prisma.item.findMany({
        where: {
            status: { in: ["OVERDUE", "FOR_SALE"] }, // Items ready for auction
            auction: { is: null } // Not already in an auction
        }
    })
}
