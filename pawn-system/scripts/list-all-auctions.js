
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Listing ALL Auctions...")
    const auctions = await prisma.auction.findMany({
        include: { Item: true }
    })

    console.log(`Total Auctions: ${auctions.length}`)
    auctions.forEach(a => {
        console.log(`ID: ${a.id} | Status: ${a.status} | Item: ${a.Item ? a.Item.name : 'N/A'} | Start: ${a.startTime}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
