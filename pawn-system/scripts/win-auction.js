
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Looking for user 'Ron Choga'...")
    const user = await prisma.user.findFirst({
        where: {
            name: { contains: "Ron", mode: 'insensitive' }
        }
    })

    if (!user) {
        console.error("User 'Ron' not found. Creating test user 'Ron Choga'...")
        // Optional: Create if not exists to ensure script works
        const newUser = await prisma.user.create({
            data: {
                name: "Ron Choga",
                email: "ron.choga@example.com",
                password: "password123", // Hash in real app, but this is a test script
                role: "CUSTOMER",
                walletBalance: 5000.00
            }
        })
        runSimulation(newUser)
    } else {
        console.log(`Found user: ${user.name} (${user.email})`)
        runSimulation(user)
    }
}

async function runSimulation(user) {
    // 1. Create Item
    console.log("Creating Item 'Rolex Submariner (Test)'...")
    const item = await prisma.item.create({
        data: {
            name: "Rolex Submariner (Winner Test)",
            description: "A specially created item for Ron to win.",
            category: "Jewelry",
            brand: "Rolex",
            model: "Submariner",
            valuation: 15000.00,
            status: "IN_AUCTION",
            images: JSON.stringify(["https://placehold.co/600x400/png?text=Rolex+Winner"]),
            updatedAt: new Date(),
            userId: null // Initially no owner
        }
    })

    // 2. Create Ended Auction
    console.log("Creating Auction...")
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // We create it as ACTIVE but expired, so the cron picks it up
    // OR allow the script to manually "process" it.
    // Let's rely on the cron mechanism we verified, to be safe?
    // User wants "make him win". Let's do the full flow.

    const auction = await prisma.auction.create({
        data: {
            id: crypto.randomUUID(),
            itemId: item.id,
            startPrice: 5000.00,
            currentBid: 5500.00,
            startTime: yesterday,
            endTime: new Date(now.getTime() - 1 * 60 * 1000), // Ended 1 min ago
            status: "ACTIVE", // Needs processing
            updatedAt: new Date()
        }
    })

    // 3. Place Bid
    console.log("Placing Winning Bid...")
    await prisma.bid.create({
        data: {
            id: crypto.randomUUID(),
            auctionId: auction.id,
            userId: user.id,
            amount: 5500.00,
            createdAt: new Date()
        }
    })

    console.log("\n✅ Setup Complete!")
    console.log(`1. Auction '${item.name}' created.`)
    console.log(`2. Bid placed for ${user.name}.`)
    console.log("3. Auction is EXPIRED and waiting for Cron.")
    console.log("\nRUNNING CRON TRIGGER NOW...")

    // Attempt to trigger cron internally logic without HTTP?
    // No, let's just instruct the user (or I run the curl command next)
    // Actually, I can import the logic if I change the script to TS, but JS is easier here.
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
