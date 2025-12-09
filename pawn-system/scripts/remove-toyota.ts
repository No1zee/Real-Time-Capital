import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const itemName = "Toyota Corolla 2018"
    console.log(`Searching for "${itemName}"...`)

    const items = await prisma.item.findMany({
        where: { name: itemName },
        include: { Auction: true }
    })

    if (items.length === 0) {
        console.log("No items found.")
        return
    }

    console.log(`Found ${items.length} items.`)

    // Delete the first one found
    const itemToDelete = items[0]
    console.log(`Deleting item ID: ${itemToDelete.id}`)

    if (itemToDelete.auction) {
        console.log(`Deleting associated auction ID: ${itemToDelete.auction.id}`)
        await prisma.auction.delete({
            where: { id: itemToDelete.auction.id }
        })
    }

    await prisma.item.delete({
        where: { id: itemToDelete.id }
    })

    console.log("Deletion complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
