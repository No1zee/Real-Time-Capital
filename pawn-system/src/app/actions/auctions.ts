"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { TransactionType, TransactionMethod, TransactionStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"

// Mock Payment Processing
// BRS: Deposit Fee is required to participate.
const MINIMUM_DEPOSIT_REQUIREMENT = 50 // Example: $50 deposit required

export async function payRegistrationDeposit(amount: number, method: TransactionMethod) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized" }
    }

    if (amount < MINIMUM_DEPOSIT_REQUIREMENT) {
        return { success: false, message: `Minimum deposit is $${MINIMUM_DEPOSIT_REQUIREMENT}` }
    }

    try {
        // 1. Create Transaction Record
        const transaction = await db.transaction.create({
            data: {
                userId: session.user.id,
                amount: amount,
                type: "DEPOSIT", // Using existing type, representing money IN
                status: "COMPLETED", // Mocking success
                method: method,
                reference: `DEP-${Date.now()}` // Mock reference
            }
        })

        // 2. Update User's Auction Deposit Balance
        // We track this separately from walletBalance to lock it?
        // BRS says "Deposit Fee... Be forfeited/Refundable". 
        // Best implementation: Add to `auctionDeposit` field.
        await db.user.update({
            where: { id: session.user.id },
            data: {
                auctionDeposit: {
                    increment: amount
                }
            }
        })

        revalidatePath("/portal/auctions")
        return { success: true, message: "Deposit successful! You can now bid." }

    } catch (error) {
        console.error("Deposit Processing Error:", error)
        return { success: false, message: "Failed to process deposit." }
    }
}

export async function checkBiddingEligibility() {
    const session = await auth()
    if (!session?.user?.id) return { eligible: false, reason: "Login required" }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { auctionDeposit: true }
    })

    if (!user) return { eligible: false, reason: "User not found" }

    // Logic: Must have at least MINIMUM deposit
    // BRS: "Users must pay a deposit fee upon registration"
    const isEligible = user.auctionDeposit && user.auctionDeposit.toNumber() >= MINIMUM_DEPOSIT_REQUIREMENT

    return {
        eligible: !!isEligible,
        currentDeposit: user.auctionDeposit?.toNumber() || 0,
        requiredDeposit: MINIMUM_DEPOSIT_REQUIREMENT
    }
}

export async function refundDeposit() {
    // BRS: "Redeemable upon request if user does not win"
    // TODO: Implement checks if user has pending bids or winning bids to pay for.
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    // Simplification for prototype: Allow refund of entire deposit balance
    try {
        const user = await db.user.findUnique({ where: { id: session.user.id } })
        if (!user || !user.auctionDeposit || user.auctionDeposit.toNumber() <= 0) {
            return { success: false, message: "No deposit to refund" }
        }

        const amount = user.auctionDeposit.toNumber()

        // 1. Create Refund Transaction
        await db.transaction.create({
            data: {
                userId: session.user.id,
                amount: amount,
                type: "WITHDRAWAL", // Money OUT
                status: "COMPLETED",
                method: "SYSTEM",
                reference: `REF-${Date.now()}`
            }
        })

        // 2. Clear Deposit
        await db.user.update({
            where: { id: session.user.id },
            data: { auctionDeposit: 0 }
        })

        revalidatePath("/portal/auctions")
        return { success: true, message: "Deposit refunded successfully." }
    } catch (e) {
        return { success: false, message: "Refund failed." }
    }
}

export async function getActiveAuctions() {
    const auctions = await db.auction.findMany({
        where: {
            status: "ACTIVE",
            endTime: { gt: new Date() }
        },
        include: {
            Item: { select: { name: true, images: true, category: true, description: true } },
            _count: { select: { Bid: true } }
        },
        orderBy: { endTime: 'asc' }
    })

    // Transform for UI if needed or return direct
    return auctions
}

export async function getEndedAuctions() {
    const auctions = await db.auction.findMany({
        where: {
            OR: [
                { status: "ENDED" },
                { endTime: { lte: new Date() } }
            ]
        },
        include: {
            Item: { select: { name: true, images: true, category: true, description: true } },
            _count: { select: { Bid: true } }
        },
        orderBy: { endTime: 'desc' },
        take: 4 // Limit to recent 4
    })
    return auctions
}

// Bidding Logic
export async function placeBid(auctionId: string, amount: number) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Login required" }

    // Admin Restriction
    if (session.user.role === "ADMIN") {
        return { success: false, message: "Administrators are not permitted to participate in auctions." }
    }

    const auction = await db.auction.findUnique({
        where: { id: auctionId },
        include: { Item: true }
    })

    if (!auction) return { success: false, message: "Auction not found" }
    if (auction.status !== "ACTIVE" || auction.endTime < new Date()) {
        return { success: false, message: "Auction has ended" }
    }

    // Amount Check
    const currentPrice = Number(auction.currentBid || auction.startPrice)
    // Rule: Must be higher than current price + increment (e.g. 5%)
    // For simplicity: Any amount > current price is valid if no bids, else > current + 1.
    if (amount <= currentPrice) {
        return { success: false, message: `Bid must be higher than ${currentPrice}` }
    }

    // Deposit Check (Double Check)
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    const MIN_DEPOSIT = 50 // Should import constant
    if (!user?.auctionDeposit || user.auctionDeposit.toNumber() < MIN_DEPOSIT) {
        return { success: false, message: "Insufficient deposit. Please top up." }
    }

    // Place Bid
    try {
        await db.$transaction(async (tx) => {
            // 1. Create Bid
            await tx.bid.create({
                data: {
                    auctionId,
                    userId: session.user.id!,
                    amount
                }
            })

            // 2. Update Auction Current Bid
            await tx.auction.update({
                where: { id: auctionId },
                data: { currentBid: amount }
            })

            // 3. Notify Outbid User
            // Find the previous highest bid (which is not the one we just created)
            const previousHighBid = await tx.bid.findFirst({
                where: {
                    auctionId,
                    userId: { not: session.user.id } // Don't notify self if self-outbidding
                },
                orderBy: { amount: 'desc' },
                skip: 1 // Skip the one we just made
            })

            if (previousHighBid) {
                await tx.notification.create({
                    data: {
                        userId: previousHighBid.userId,
                        type: "OUTBID",
                        title: "You've been outbid!",
                        message: `A new bid of $${amount} has been placed on an item you're watching.`,
                        link: `/portal/auctions/${auctionId}`,
                        auctionId
                    }
                })
            }
        })

        // 4. Trigger Real-Time Update
        if (pusherServer) {
            try {
                // Get updated count
                const bidCount = await db.bid.count({ where: { auctionId } })

                await pusherServer.trigger(`auction-${auctionId}`, 'new-bid', {
                    currentBid: amount,
                    bidCount: bidCount,
                    lastBidTime: new Date().toISOString(),
                    lastBidderId: session.user.id
                })
            } catch (pusherError) {
                console.error("Pusher Trigger Error:", pusherError)
                // Non-blocking: don't fail the bid if realtime fails
            }
        }

        revalidatePath(`/portal/auctions/${auctionId}`)
        return { success: true, message: "Bid placed successfully!" }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to place bid" }
    }
}
