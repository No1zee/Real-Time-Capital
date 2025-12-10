
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Processing 'IN_AUCTION' Items...")

    // 1. Find items in 'IN_AUCTION' status that don't have an Auction record
    const items = await prisma.item.findMany({
        where: {
            name: { contains: 'Gibson', mode: 'insensitive' },
            status: 'IN_AUCTION',
            Auction: { is: null }
        }
    })

    console.log(`Found ${items.length} items ready for auction.`)

    for (const item of items) {
        console.log(`Creating Auction for: ${item.name} (${item.id})`)

        // Start NOW, End in 24 hours
        const startTime = new Date()
        const endTime = new Date()
        endTime.setHours(endTime.getHours() + 24)

        // Set Start Price to Valuation + 10% (or similar logic)
        // Ensure valuation is treated as a number
        const startPrice = Number(item.valuation) * 1.1

        await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice: startPrice,
                currentBid: startPrice, // Initial bid usually matches start price or null
                startTime: startTime,
                endTime: endTime,
                status: 'ACTIVE', // Set directly to ACTIVE for immediate visibility
                isPractice: false
            }
        })
        console.log(`✅ Auction Created & ACTIVATED!`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
