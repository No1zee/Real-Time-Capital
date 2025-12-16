"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { TransactionType, TransactionMethod, TransactionStatus, AssetType } from "@prisma/client"
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

export async function getActiveAuctions(category?: string) {
    const whereClause: any = {
        status: "ACTIVE",
        endTime: { gt: new Date() }
    }

    if (category && category !== "ALL") {
        // Validate if category is a valid AssetType to prevent Prisma validation errors
        if (Object.values(AssetType).includes(category as AssetType)) {
            whereClause.Item = {
                category: category as AssetType
            }
        }
    }

    const auctions = await db.auction.findMany({
        where: whereClause,
        include: {
            // Revert to including full item or at least keep select consistent with previous view if wanted. 
            // But previously view showed 'Item: { select: ... }'. 
            // To be safe and compatible with Auction type that expects Item, I should probably include Item: true or include mapped select.
            // The previous view had: Item: { select: { name: true, images: true, category: true, description: true } }
            // But my other code expects 'Item.name', 'Item.images' - which are string/json.
            // Wait, 'Item.images' is string, but select returns object? No, Prisma returns object with fields.
            // Let's stick to what was there but add filtering.
            Item: { select: { name: true, images: true, category: true, description: true } },
            _count: { select: { Bid: true } }
        },
        orderBy: { endTime: 'asc' }
    })

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
// BRS: Hammer and Tongues Extension Rule (e.g. within last 5 mins)
const EXTENSION_WINDOW_MINUTES = 5
const EXTENSION_DURATION_MINUTES = 5

export async function checkAndExtendAuction(auctionId: string) {
    const auction = await db.auction.findUnique({ where: { id: auctionId } })
    if (!auction?.allowAutoExtend) return

    const now = new Date()
    const timeLeft = auction.endTime.getTime() - now.getTime()
    const minutesLeft = timeLeft / (1000 * 60)

    if (minutesLeft <= EXTENSION_WINDOW_MINUTES && minutesLeft > 0) {
        const newEndTime = new Date(auction.endTime.getTime() + EXTENSION_DURATION_MINUTES * 60000)
        await db.auction.update({
            where: { id: auctionId },
            data: {
                endTime: newEndTime,
                extendedCount: { increment: 1 }
            }
        })
        return true // Extended
    }
    return false
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
    const bidAmount = Number(amount)

    if (bidAmount <= currentPrice) {
        return { success: false, message: `Bid must be higher than ${currentPrice}` }
    }

    // Deposit Check (Double Check)
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.auctionDeposit || user.auctionDeposit.toNumber() < MINIMUM_DEPOSIT_REQUIREMENT) {
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
                    amount: bidAmount
                }
            })

            // 2. Update Auction Current Bid
            await tx.auction.update({
                where: { id: auctionId },
                data: { currentBid: bidAmount }
            })

            // 3. Check for Proxy Bids (Auto-Bidding)
            // Find any AutoBids for this auction where maxAmount > current bidAmount
            // We need to exclude the current user if they have an auto-bid (though they just manually bid, so maybe update their max?)
            // For simplicity: Find valid auto-bids from OTHER users
            const competingAutoBids = await tx.autoBid.findMany({
                where: {
                    auctionId,
                    userId: { not: session.user.id },
                    maxAmount: { gt: bidAmount }
                },
                orderBy: { maxAmount: 'desc' } // Highest max first
            })

            if (competingAutoBids.length > 0) {
                // The highest max bidder should technically win immediately with (currentBid + increment)
                // Assuming increment is small, say 5 or dynamic.
                const highestAutoBid = competingAutoBids[0]
                let autoBidAmount = bidAmount + 5 // Simple increment

                // If autoBidAmount exceeds their max, cap it (though query said > bidAmount, so it should be fine)
                if (autoBidAmount > Number(highestAutoBid.maxAmount)) {
                    autoBidAmount = Number(highestAutoBid.maxAmount)
                }

                // Place the auto-bid
                await tx.bid.create({
                    data: {
                        auctionId,
                        userId: highestAutoBid.userId,
                        amount: autoBidAmount
                    }
                })
                await tx.auction.update({
                    where: { id: auctionId },
                    data: { currentBid: autoBidAmount }
                })

                // Notify the manual bidder they were immediately outbid
                // (Notification logic omitted for brevity, but same pattern as below)
            }
        })

        // 4. Check for Auto-Extension (outside-transaction to avoid locking if possible, or inside)
        await checkAndExtendAuction(auctionId)

        // 5. Trigger Real-Time Update
        if (pusherServer) {
            const updatedAuction = await db.auction.findUnique({ where: { id: auctionId } })
            const bidCount = await db.bid.count({ where: { auctionId } })

            await pusherServer.trigger(`auction-${auctionId}`, 'new-bid', {
                currentBid: updatedAuction?.currentBid,
                bidCount: bidCount,
                lastBidTime: new Date().toISOString(),
                lastBidderId: session.user.id
            })
        }

        revalidatePath(`/portal/auctions/${auctionId}`)
        return { success: true, message: "Bid placed successfully!" }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to place bid" }
    }
}

export async function placeProxyBid(auctionId: string, maxAmount: number) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Login required" }

    try {
        await db.autoBid.upsert({
            where: {
                userId_auctionId: {
                    userId: session.user.id,
                    auctionId
                }
            },
            update: {
                maxAmount,
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                auctionId,
                maxAmount,
                updatedAt: new Date()
            }
        })

        // Optionally trigger a check to see if this new max immediately outbids the current price?
        // For now, it just sits until someone else bids. 
        // Or we should run the "compete" logic immediately if current price < maxAmount and not currently winning.

        return { success: true, message: "Max bid set successfully. We will bid for you." }
    } catch (e) {
        return { success: false, message: "Failed to set max bid." }
    }
}

export async function payForAuction(auctionId: string, method: TransactionMethod, reference: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    const auction = await db.auction.findUnique({
        where: { id: auctionId },
        include: { Item: true }
    })

    if (!auction) return { success: false, message: "Auction not found" }
    if (auction.Item.status === "SOLD") return { success: false, message: "Already paid." }

    const price = Number(auction.currentBid || 0)
    const levy = price * (auction.buyerLevyPercent / 100)
    const vat = price * (auction.vatPercent / 100)
    const totalAmount = price + levy + vat

    try {
        await db.$transaction([
            db.transaction.create({
                data: {
                    userId: session.user.id,
                    amount: totalAmount,
                    type: "PAYMENT",
                    status: "COMPLETED",
                    method: method,
                    reference: reference
                }
            }),
            db.item.update({
                where: { id: auction.itemId },
                data: {
                    status: "SOLD",
                    salePrice: price,
                    soldAt: new Date(),
                    userId: session.user.id
                }
            })
        ])

        revalidatePath("/portal/auctions/my-bids")
        return { success: true, message: "Payment successful! Item is now yours." }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Payment failed." }
    }
}

export async function buyItem(auctionId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    const auction = await db.auction.findUnique({
        where: { id: auctionId },
        include: { Item: true }
    })

    if (!auction) return { success: false, message: "Auction not found" }
    if (!auction.buyNowPrice) return { success: false, message: "Buy Now not available" }
    if (auction.status !== "ACTIVE") return { success: false, message: "Auction is not active" }

    const userId = session.user.id!

    // End auction immediately and mark user as winner
    try {
        await db.$transaction(async (tx) => {
            // Create a "winning" bid at the buy now price if needed, or just set winner
            // Better to create a bid so it shows in history
            const bid = await tx.bid.create({
                data: {
                    amount: auction.buyNowPrice!,
                    auctionId: auction.id,
                    userId: userId
                }
            })

            await tx.auction.update({
                where: { id: auctionId },
                data: {
                    status: "ENDED",
                    currentBid: auction.buyNowPrice,
                    winnerId: userId,
                    endTime: new Date() // End now
                }
            })

            // Mark item as SOLD? Or wait for payment?
            // Usually wait for payment. Status is ENDED, winner is set.
        })

        revalidatePath("/portal/auctions")
        return { success: true, message: "Item purchased successfully! Please proceed to payment." }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to process Buy Now" }
    }
}
