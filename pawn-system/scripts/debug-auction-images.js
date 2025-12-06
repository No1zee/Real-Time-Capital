
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Debugging Auction Images...")

    const auction = await prisma.auction.findFirst({
        where: {
            item: {
                name: {
                    contains: "Rolex"
                }
            }
        },
        include: {
            item: true
        }
    })

    if (!auction) {
        console.log("Rolex auction not found.")
        return
    }

    console.log("Auction ID:", auction.id)
    console.log("Item Name:", auction.item.name)
    console.log("Item Images (Raw):", auction.item.images)
    console.log("Item Images Type:", typeof auction.item.images)

    try {
        const parsed = JSON.parse(auction.item.images)
        console.log("Parsed Images:", parsed)
        console.log("First Image:", parsed[0])
    } catch (e) {
        console.log("Error parsing images:", e.message)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
