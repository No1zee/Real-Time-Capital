import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("😈 Rival Bidder Entering the Chat...")

    // 1. Find the most recent active auction
    const auction = await prisma.auction.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        include: { bids: { orderBy: { amount: "desc" }, take: 1 } }
    })

    if (!auction) {
        console.error("❌ No active auction found! Please start an auction and place a bid first.")
        return
    }

    console.log(`🎯 Targeting Auction: ${auction.id}`)
    const currentBid = Number(auction.bids[0]?.amount || auction.startPrice)
    const nextBid = currentBid + 50

    // 2. Create or find Rival User
    const rivalEmail = "rival@example.com"
    let rival = await prisma.user.findUnique({ where: { email: rivalEmail } })

    if (!rival) {
        rival = await prisma.user.create({
            data: {
                name: "Rival Bidder",
                email: rivalEmail,
                password: "password123", // hash doesn't matter for script
                role: "CUSTOMER"
            }
        })
        console.log("👤 Created Rival User")
    }

    // 3. Place Bid
    // We need to manually create the notification here because we are bypassing the server action
    // In a real app, we would call the server action, but here we are using Prisma directly.
    // WAIT! If I use Prisma directly, the `placeBid` server action logic (which creates the notification) won't run.
    // I should duplicate the notification logic here to simulate the backend process.

    console.log(`💰 Placing bid of $${nextBid}...`)

    await prisma.$transaction(async (tx) => {
        // Create Bid
        await tx.bid.create({
            data: {
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
        if (auction.bids.length > 0) {
            const previousBidderId = auction.bids[0].userId
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
