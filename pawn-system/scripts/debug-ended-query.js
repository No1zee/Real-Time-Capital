
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Simulating 'Recently Ended' Query...")

    // Exact logic from getAuctions when includeArchived=true
    const where = {
        status: { in: ["ENDED"] }
    }

    // Logic for sort='endTime_desc'
    const orderBy = { endTime: "desc" }

    const auctions = await prisma.auction.findMany({
        where,
        include: { Item: true, _count: { select: { Bid: true } } },
        orderBy,
        take: 4 // The UI slices (0, 4)
    })

    console.log(`Found ${auctions.length} ended auctions.`)
    auctions.forEach(a => {
        console.log(`- [${a.status}] ${a.Item ? a.Item.name : 'Unknown Item'} (Ends: ${a.endTime})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
