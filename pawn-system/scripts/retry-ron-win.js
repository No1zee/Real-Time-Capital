
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log(" giving Ron more money and resetting auction...")

    // 1. Find Ron
    const ron = await prisma.user.findFirst({
        where: { name: { contains: "Ron", mode: 'insensitive' } }
    })

    if (!ron) { console.error("Ron not found"); return; }

    // 2. Update Wallet
    await prisma.user.update({
        where: { id: ron.id },
        data: { walletBalance: 20000.00 }
    })
    console.log(`✅ Updated Ron's wallet to $20,000`)

    // 3. Find the Auction (The one for the Rolex)
    const item = await prisma.item.findFirst({
        where: { name: "Rolex Submariner (Winner Test)" },
        include: { Auction: true } // Relation is usually 1-to-many in schema, but logical 1-to-1 active. 
        // Wait, schema might be many auctions per item over time.
        // We want the latest one.
    })

    if (!item) { console.error("Item not found"); return }

    // Find the specific auction we just ran (likely the last one created for this item)
    const auction = await prisma.auction.findFirst({
        where: { itemId: item.id },
        orderBy: { createdAt: 'desc' }
    })

    if (!auction) { console.error("Auction not found"); return }

    // 4. Reset Auction to ACTIVE but EXPIRED
    await prisma.auction.update({
        where: { id: auction.id },
        data: {
            status: "ACTIVE", // Needs processing again
            endTime: new Date(Date.now() - 60000) // Ended 1 min ago
        }
    })

    // 5. Ensure Item is in a state that allows selling (in case logic checks it)
    // Attempting to sell usually requires item status to be IN_AUCTION?
    // The processor might reset it to VALUED on failure.
    // Let's force it back to "IN_AUCTION" so the processor logic accepts it.
    await prisma.item.update({
        where: { id: item.id },
        data: { status: "IN_AUCTION" }
    })

    console.log(`✅ Reset Auction ${auction.id} to ACTIVE (Expired)`)
    console.log(`✅ Reset Item status to IN_AUCTION`)
    console.log("READY for Cron Trigger!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
