
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Creating a test auction that ends in 2 minutes...")

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000) // Ends in 2 mins

    // 1. Create Item
    const item = await prisma.item.create({
        data: {
            name: "TEST: Fast Auction Item",
            description: "This item is for testing the automated closing flow.",
            category: "Electronics",
            brand: "TestBrand",
            model: "X-2000",
            valuation: 500.00,
            status: "IN_AUCTION",
            images: JSON.stringify(["https://placehold.co/600x400/png?text=TEST+ITEM"]),
            updatedAt: new Date()
        }
    })

    // 2. Create Active Auction
    const auction = await prisma.auction.create({
        data: {
            itemId: item.id,
            startPrice: 100.00,
            currentBid: 100.00,
            startTime: fiveMinutesAgo,
            endTime: twoMinutesFromNow,
            status: "ACTIVE",
            updatedAt: new Date()
        }
    })

    console.log(`\nSUCCESS! Created Auction ID: ${auction.id}`)
    console.log(`Item Name: ${item.name}`)
    console.log(`Ends At: ${twoMinutesFromNow.toLocaleTimeString()}`)
    console.log(`\n-> Go to http://localhost:3000/portal/auctions/${auction.id}`)
    console.log(`-> LOGIN as a user (different from owner if possible) and PLACE A BID immediately!`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
