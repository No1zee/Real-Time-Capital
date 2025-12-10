
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking Test Auction Status...")

    const item = await prisma.item.findFirst({
        where: { name: "TEST: Fast Auction Item" },
        include: { Auction: { include: { Bid: true } } }
    })

    if (!item || !item.Auction) {
        console.log("Test item or auction not found!")
        return
    }

    const auction = item.Auction
    const now = new Date()

    console.log(`\n--- STATUS REPORT ---`)
    console.log(`Item: ${item.name}`)
    console.log(`Auction Status: ${auction.status}`)
    console.log(`Current Time: ${now.toLocaleTimeString()}`)
    console.log(`End Time: ${auction.endTime.toLocaleTimeString()}`)
    console.log(`Time Diff: ${Math.round((now - auction.endTime) / 1000)} seconds since expiry`)
    console.log(`Bids Count: ${auction.Bid.length}`)

    if (auction.Bid.length > 0) {
        console.log(`Highest Bid: $${auction.Bid[0].amount}`)
        console.log(`Winner ID: ${auction.Bid[0].userId}`)
    } else {
        console.log("No bids placed.")
    }

    if (auction.status === "ENDED") {
        console.log("✅ SUCCESS: Auction has ended!")
        if (item.status === "SOLD") {
            console.log("✅ SUCCESS: Item marked as SOLD!")
        } else if (item.status === "VALUED") {
            console.log("ℹ️ RESULT: Item returned to VALUED (No valid payment/bids).")
        } else {
            console.log(`⚠️ CHECK: Item status is ${item.status}`)
        }
    } else {
        console.log("⏳ WAITING: Auction is still ACTIVE.")
        if (now > auction.endTime) {
            console.log("⚠️ PENDING: Time has passed, but Cron hasn't run yet.")
            console.log("   (You might need to trigger /api/cron/auction-lifecycle manually if 5 mins haven't passed)")
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
