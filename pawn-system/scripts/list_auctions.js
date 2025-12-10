
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Listing all auctions...")
    const auctions = await prisma.auction.findMany({
        select: {
            id: true,
            status: true,
            endTime: true,
            Item: {
                select: { name: true }
            }
        }
    })

    console.log(JSON.stringify(auctions, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
