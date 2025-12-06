import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🧹 Resetting Auction Data...")

    // 1. Delete all bids
    await prisma.bid.deleteMany({})
    console.log("✅ Deleted all bids")

    // 2. Delete all notifications
    await prisma.notification.deleteMany({})
    console.log("✅ Deleted all notifications")

    // 3. Delete all auto-bids
    await prisma.autoBid.deleteMany({})
    console.log("✅ Deleted all auto-bids")

    // 4. Reset Auction prices
    await prisma.auction.updateMany({
        data: {
            currentBid: null,
            status: "ACTIVE"
        }
    })
    console.log("✅ Reset auction prices")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
