import { PrismaClient } from "@prisma/client"
import * as crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    // ... existing code ...
    await prisma.$transaction(async (tx) => {
        // Create Bid
        await tx.bid.create({
            data: {
                id: crypto.randomUUID(),
                amount: nextBid,
                userId: rival.id,
                auctionId: auction.id
            }
        })

        // Update Auction
        await tx.auction.update({
            where: { id: auction.id },
            data: { currentBid: nextBid }
        })

        // Create Notification for the previous bidder (if exists)
        if (auction.Bid.length > 0) {
            const previousBidderId = auction.Bid[0].userId
            // Don't notify if the rival is outbidding themselves (unlikely but possible)
            if (previousBidderId !== rival.id) {
                await tx.notification.create({
                    data: {
                        userId: previousBidderId,
                        type: "OUTBID",
                        message: `You have been outbid! Rival Bidder placed a bid of $${nextBid}.`,
                        auctionId: auction.id
                    }
                })
                console.log(`🔔 Notification sent to user ${previousBidderId}`)
            }
        }
    })

    console.log("✅ Bid placed successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
