import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const ORIGINAL_NAMES = [
    "iPhone 14 Pro Max",
    "Sony PlayStation 5",
    "MacBook Air M2"
]

async function main() {
    console.log("Identifying original auctions...")

    // Find items that match the original names
    const originalItems = await prisma.item.findMany({
        where: {
            name: { in: ORIGINAL_NAMES }
        }
    })

    const originalItemIds = originalItems.map(i => i.id)
    console.log(`Found ${originalItemIds.length} original items to keep.`)

    // Delete auctions NOT linked to these items
    console.log("Deleting extra auctions...")
    const { count: deletedAuctions } = await prisma.auction.deleteMany({
        where: {
            itemId: { notIn: originalItemIds }
        }
    })
    console.log(`Deleted ${deletedAuctions} extra auctions.`)

    // Delete items NOT linked to these IDs (and are auction items)
    // We need to be careful not to delete items that are just in loans but not auctions.
    // But the seed script created items specifically for auctions with status "IN_AUCTION".
    console.log("Deleting extra items...")
    const { count: deletedItems } = await prisma.item.deleteMany({
        where: {
            id: { notIn: originalItemIds },
            status: "IN_AUCTION"
        }
    })
    console.log(`Deleted ${deletedItems} extra items.`)

    console.log("Cleanup complete. Remaining auctions:")
    const remaining = await prisma.auction.findMany({
        include: { item: true }
    })
    remaining.forEach(a => console.log(`- ${a.item.name}`))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
