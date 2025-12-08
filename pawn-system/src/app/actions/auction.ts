"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"
import { redirect } from "next/navigation"

export async function createAuction(formData: FormData) {
    const session = await auth()
    const user = session?.user as any
    if (user?.role !== "STAFF" && user?.role !== "ADMIN") {
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
        data: { status: "IN_AUCTION" },
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

    if (user.role === "ADMIN" || user.role === "STAFF") {
        throw new Error("Administrators and staff cannot participate in auctions")
    }

    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { item: true }
    })

    if (!auction) throw new Error("Auction not found")

    // High Value Item Access Control
    // Value > 1000 or Current Bid > 1000
    const currentPriceCheck = Number(auction.currentBid || auction.startPrice)
    const isHighValue = Number(auction.item.valuation) > 1000 || currentPriceCheck > 1000

    if (isHighValue && user.verificationStatus !== "VERIFIED") {
        throw new Error("Identity verification required for high-value items")
    }

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

    if (user.role === "ADMIN" || user.role === "STAFF") {
        throw new Error("Administrators and staff cannot participate in auctions")
    }

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

export interface AuctionFilters {
    query?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sort?: string
}

export async function getAuctions(role: "STAFF" | "CUSTOMER" = "CUSTOMER", filters?: AuctionFilters, includeArchived: boolean = false) {
    const now = new Date()

    if (role === "STAFF") {
        return await prisma.auction.findMany({
            include: { item: true, bids: true },
            orderBy: { createdAt: "desc" },
        })
    }

    // Build where clause for filters
    // Default: Active/Scheduled. If archived, then Ended/Sold
    const where: any = {}

    if (includeArchived) {
        where.status = {
            in: ["ENDED", "SOLD", "COMPLETED"] // Catch-all for end states
        }
    } else {
        where.OR = [
            { status: "ACTIVE" },
            { status: "SCHEDULED" }
        ]
    }

    if (filters?.query) {
        where.item = {
            OR: [
                { name: { contains: filters.query } }, // SQLite is case-insensitive by default for contains? No, usually case-sensitive.
                // Prisma with SQLite: contains is case-insensitive?
                // Actually, for SQLite, Prisma maps contains to LIKE which is case-insensitive for ASCII characters.
                { description: { contains: filters.query } }
            ]
        }
    }

    if (filters?.category && filters.category !== "All") {
        where.item = {
            ...where.item,
            category: filters.category
        }
    }

    if (filters?.minPrice || filters?.maxPrice) {
        where.currentBid = {
            gte: filters.minPrice || 0,
            lte: filters.maxPrice || 1000000 // Arbitrary high number
        }
        // Also check startPrice if no bids? 
        // Complex with Prisma OR logic for price. 
        // Let's simplify: Filter based on current price (which is currentBid or startPrice)
        // Prisma doesn't support computed fields in where easily.
        // For now, let's filter on startPrice if currentBid is null, or currentBid.
        // Actually, let's just filter on startPrice for simplicity in this iteration, 
        // or we can do post-filtering if dataset is small. 
        // Given it's a prototype/MVP, let's try to do it in DB if possible.
        // But `currentBid` is nullable.
        // Let's stick to simple filtering on `startPrice` for now as a proxy, or just `currentBid` if it exists.
        // A better approach for "Current Price" filter:
        // We can't easily do (currentBid ?? startPrice) in Prisma where.
        // Let's ignore price filter in DB for now and do it in memory if needed, or just filter strictly on startPrice.
        // User request: "Powerful search and filtering".
        // Let's try to be accurate.
        // We can use OR:
        // OR: [
        //   { currentBid: { gte: min, lte: max } },
        //   { currentBid: null, startPrice: { gte: min, lte: max } }
        // ]
        const min = filters.minPrice || 0
        const max = filters.maxPrice || 1000000

        where.AND = [
            {
                OR: [
                    { currentBid: { gte: min, lte: max } },
                    { currentBid: null, startPrice: { gte: min, lte: max } }
                ]
            }
        ]
    }

    // Sort logic
    let orderBy: any = { endTime: "asc" }
    if (filters?.sort) {
        switch (filters.sort) {
            case "ending_soon":
                orderBy = { endTime: "asc" }
                break
            case "newly_listed":
                orderBy = { startTime: "desc" }
                break
            case "price_asc":
                orderBy = { startPrice: "asc" } // Approximation
                break
            case "price_desc":
                orderBy = { startPrice: "desc" } // Approximation
                break
        }
    } else if (includeArchived) {
        // Default sort for archive: Most recently ended
        orderBy = { endTime: "desc" }
    }

    return await prisma.auction.findMany({
        where,
        include: { item: true, _count: { select: { bids: true } } },
        orderBy,
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
            status: "PAWNED",
            loan: { status: "DEFAULTED" },
            auction: { is: null } // Not already in an auction
        }
    })
}
