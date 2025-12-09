import { prisma } from "@/lib/prisma"
import { createNotification } from "@/app/actions/notification"

/**
 * Activate auctions that have reached their start time
 */
export async function activateScheduledAuctions() {
    const now = new Date()

    const auctionsToActivate = await prisma.auction.findMany({
        where: {
            status: "SCHEDULED",
            startTime: { lte: now }
        }
    })

    const results = {
        activated: [] as string[],
        errors: [] as { id: string; error: string }[]
    }

    for (const auction of auctionsToActivate) {
        try {
            await prisma.auction.update({
                where: { id: auction.id },
                data: {
                    status: "ACTIVE",
                    updatedAt: new Date()
                }
            })

            // Notify watchlist users that auction has started
            const watchlistUsers = await prisma.watchlist.findMany({
                where: { auctionId: auction.id }
            })

            for (const watcher of watchlistUsers) {
                await createNotification(
                    watcher.userId,
                    "Auction Started",
                    `An auction you're watching has just started!`,
                    "SYSTEM",
                    `/portal/auctions/${auction.id}`
                )
            }

            results.activated.push(auction.id)
        } catch (error) {
            results.errors.push({
                id: auction.id,
                error: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }

    return results
}

/**
 * End auctions that have reached their end time
 */
export async function endExpiredAuctions() {
    const now = new Date()

    const auctionsToEnd = await prisma.auction.findMany({
        where: {
            status: "ACTIVE",
            endTime: { lte: now }
        },
        include: {
            Bid: {
                orderBy: { amount: "desc" },
                take: 10,
                include: { User: true }
            },
            Item: true
        }
    })

    const results = {
        ended: [] as string[],
        errors: [] as { id: string; error: string }[]
    }

    for (const auction of auctionsToEnd) {
        try {
            if (auction.Bid.length === 0) {
                // No bids - return item to previous status
                await handleNoBidsAuction(auction)
                results.ended.push(auction.id)
            } else {
                // Process winner
                await processAuctionWinner(auction)
                results.ended.push(auction.id)
            }
        } catch (error) {
            results.errors.push({
                id: auction.id,
                error: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }

    return results
}

/**
 * Handle auction that ended with no bids
 */
async function handleNoBidsAuction(auction: any) {
    await prisma.auction.update({
        where: { id: auction.id },
        data: {
            status: "ENDED",
            updatedAt: new Date()
        }
    })

    // Return item to VALUED status (available for re-auction or loan)
    await prisma.item.update({
        where: { id: auction.itemId },
        data: { status: "VALUED" }
    })
}

/**
 * Process auction winner and payment
 */
async function processAuctionWinner(auction: any) {
    const winningBid = auction.Bid[0]
    const winAmount = Number(winningBid.amount)

    // Try to process payment from winner
    const paymentSuccess = await processWinnerPayment(
        winningBid.userId,
        winAmount,
        auction.id,
        auction.itemId
    )

    if (paymentSuccess) {
        // Payment successful - finalize auction
        await finalizeAuctionSale(auction, winningBid.userId, winAmount)

        // Notify winner
        await createNotification(
            winningBid.userId,
            "Congratulations! You Won!",
            `You won the auction for ${auction.Item.name}. Payment of $${winAmount} has been deducted from your wallet.`,
            "AUCTION_WON",
            `/portal/auctions/${auction.id}`
        )

        // Notify losers
        for (let i = 1; i < auction.Bid.length; i++) {
            const loser = auction.Bid[i]
            await createNotification(
                loser.userId,
                "Auction Ended",
                `The auction for ${auction.Item.name} has ended. You were outbid.`,
                "AUCTION_LOST",
                `/portal/auctions/${auction.id}`
            )
        }
    } else {
        // Payment failed - try next bidder or cancel
        await handlePaymentFailure(auction, 0)
    }
}

/**
 * Attempt to deduct payment from winner's wallet
 */
async function processWinnerPayment(
    userId: string,
    amount: number,
    auctionId: string,
    itemId: string
): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) return false

        const walletBalance = Number(user.walletBalance)

        if (walletBalance < amount) {
            // Insufficient funds
            return false
        }

        // Deduct from wallet and create transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { decrement: amount } }
            }),
            prisma.transaction.create({
                data: {
                    id: crypto.randomUUID(),
                    userId,
                    amount,
                    type: "PAYMENT",
                    status: "COMPLETED",
                    method: "SYSTEM",
                    reference: `AUCTION-${auctionId}`,
                    updatedAt: new Date()
                }
            })
        ])

        return true
    } catch (error) {
        console.error("Payment processing error:", error)
        return false
    }
}

/**
 * Finalize auction sale - mark as ENDED and SOLD
 */
async function finalizeAuctionSale(auction: any, winnerId: string, soldPrice: number) {
    await prisma.$transaction([
        prisma.auction.update({
            where: { id: auction.id },
            data: {
                status: "ENDED",
                updatedAt: new Date()
            }
        }),
        prisma.item.update({
            where: { id: auction.itemId },
            data: {
                status: "SOLD",
                salePrice: soldPrice,
                soldAt: new Date()
            }
        })
    ])
}

/**
 * Handle payment failure - try next bidder
 */
async function handlePaymentFailure(auction: any, failedBidderIndex: number) {
    const nextBidderIndex = failedBidderIndex + 1

    if (nextBidderIndex >= auction.Bid.length) {
        // No more bidders - cancel auction
        await prisma.auction.update({
            where: { id: auction.id },
            data: {
                status: "ENDED",
                updatedAt: new Date()
            }
        })

        await prisma.item.update({
            where: { id: auction.itemId },
            data: { status: "VALUED" }
        })

        // Notify all bidders
        for (const bid of auction.Bid) {
            await createNotification(
                bid.userId,
                "Auction Cancelled",
                `The auction for ${auction.Item.name} could not be completed due to payment issues.`,
                "SYSTEM",
                `/portal/auctions/${auction.id}`
            )
        }
        return
    }

    const nextBid = auction.Bid[nextBidderIndex]
    const nextAmount = Number(nextBid.amount)

    // Try next bidder
    const paymentSuccess = await processWinnerPayment(
        nextBid.userId,
        nextAmount,
        auction.id,
        auction.itemId
    )

    if (paymentSuccess) {
        await finalizeAuctionSale(auction, nextBid.userId, nextAmount)

        // Notify new winner
        await createNotification(
            nextBid.userId,
            "Congratulations! You Won!",
            `The previous winner couldn't complete payment. You won the auction for ${auction.Item.name}!`,
            "AUCTION_WON",
            `/portal/auctions/${auction.id}`
        )
    } else {
        // Try next bidder
        await handlePaymentFailure(auction, nextBidderIndex)
    }
}
