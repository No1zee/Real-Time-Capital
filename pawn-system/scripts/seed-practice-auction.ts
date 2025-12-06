import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding Practice Auction...")

    // 0. Ensure a user exists
    let user = await prisma.user.findFirst()
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: "System Seeder",
                email: "seeder@system.com",
                password: "password",
                role: "ADMIN"
            }
        })
    }
    console.log("User:", user)

    // 0.5 Check existing items
    const items = await prisma.item.findMany({ take: 1 })
    console.log("Existing items:", items)

    // 1. Create a dummy item
    try {
        const item = await prisma.item.create({
            data: {
                name: "Practice Rolex Submariner",
                description: "Practice Item",
                valuation: "15000"
            }
        })

        // 2. Create the auction
        const startTime = new Date()
        const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

        const auction = await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice: 5000,
                startTime,
                endTime,
                status: "ACTIVE",
                isPractice: true
            }
        })

        console.log(`✅ Created Practice Auction: ${auction.id}`)
    } catch (e) {
        console.error("❌ Error creating item/auction:")
        console.dir(e, { depth: null })
    }
}

main()
    .finally(() => prisma.$disconnect())
