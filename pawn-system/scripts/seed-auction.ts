import { PrismaClient, Prisma } from "@prisma/client"
import { PrismaClientValidationError } from "@prisma/client/runtime/library"

const prisma = new PrismaClient()

async function main() {
    // Force update for deployment
    console.log("🌱 Seeding Test Auction...")

    // 1. Create an Item
    const item = await prisma.item.create({
        data: {
            name: "Test Notification Item " + Date.now(),
            description: "A perfect item for testing notifications.",
            category: "Electronics",
            valuation: 500,
            images: "[]",
            status: "IN_AUCTION",
        }
    })

    // 2. Create Auction
    const startTime = new Date()
    const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    const auction = await prisma.auction.create({
        data: {
            itemId: item.id,
            startPrice: 100,
            startTime,
            endTime,
            status: "ACTIVE",
        }
    })

    console.log(`✅ Created Auction: ${auction.id} for Item: ${item.name}`)
}

main()
    .catch((e) => {
        console.error("❌ Error seeding auction:")
        console.error(e)
        if (e instanceof PrismaClientValidationError) {
            console.error(e.message)
        }
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
