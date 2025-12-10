
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Verifying Public Auction Visibility...")

    const auctions = await prisma.auction.findMany({
        where: { status: 'ACTIVE' },
        include: { Item: true }
    })

    const gibson = auctions.find(a => a.Item.name.includes("Gibson"))

    if (gibson) {
        console.log(`✅ SUCCESS: 'Vintage Gibson Guitar' is LIVE.`)
        console.log(`   - Auction ID: ${gibson.id}`)
        console.log(`   - Current Bid: $${gibson.currentBid}`)
        console.log(`   - Ends: ${gibson.endTime}`)
    } else {
        console.log(`❌ FAILURE: Gibson Guitar not found in ACTIVE auctions.`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
