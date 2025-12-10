/**
 * Test script for auction lifecycle
 * Run with: npx tsx scripts/test-auction-lifecycle.ts
 */

import { PrismaClient, AssetType, ItemStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function createTestAuctions() {
    console.log("Creating test auctions...")

    // Get a test user
    const testUser = await prisma.user.findFirst({
        where: { role: "CUSTOMER" }
    })

    if (!testUser) {
        console.error("No customer users found. Please create a test user first.")
        return
    }

    // Create test items first
    const testItem1 = await prisma.item.create({
        data: {
            id: crypto.randomUUID(),
            name: "Test Auction Item - Ending Soon",
            description: "This auction will end in 2 minutes",
            category: AssetType.ELECTRONICS,
            valuation: 500,
            status: ItemStatus.IN_AUCTION,
            userId: testUser.id,
            updatedAt: new Date()
        }
    })

    const testItem2 = await prisma.item.create({
        data: {
            id: crypto.randomUUID(),
            name: "Test Auction Item - Starting Soon",
            description: "This auction will start in 2 minutes",
            category: AssetType.JEWELRY,
            valuation: 1000,
            status: ItemStatus.IN_AUCTION,
            userId: testUser.id,
            updatedAt: new Date()
        }
    })

    // Create auction ending in 2 minutes
    const endingSoon = new Date()
    endingSoon.setMinutes(endingSoon.getMinutes() + 2)

    await prisma.auction.create({
        data: {
            id: crypto.randomUUID(),
            itemId: testItem1.id,
            startPrice: 100,
            currentBid: 250,
            startTime: new Date(Date.now() - 60000), // Started 1 minute ago
            endTime: endingSoon,
            status: "ACTIVE",
            updatedAt: new Date()
        }
    })

    // Add a bid to the ending auction
    await prisma.bid.create({
        data: {
            id: crypto.randomUUID(),
            auctionId: testItem1.id,
            userId: testUser.id,
            amount: 250
        }
    })

    // Create auction starting in 2 minutes
    const startingSoon = new Date()
    startingSoon.setMinutes(startingSoon.getMinutes() + 2)

    const endingLater = new Date(startingSoon)
    endingLater.setHours(endingLater.getHours() + 2)

    await prisma.auction.create({
        data: {
            id: crypto.randomUUID(),
            itemId: testItem2.id,
            startPrice: 200,
            startTime: startingSoon,
            endTime: endingLater,
            status: "SCHEDULED",
            updatedAt: new Date()
        }
    })

    console.log("✅ Test auctions created successfully!")
    console.log("\nTest scenarios:")
    console.log("1. Auction ending in 2 minutes (has 1 bid)")
    console.log("2. Auction starting in 2 minutes")
    console.log("\nTo test manually:")
    console.log("curl -X POST http://localhost:3000/api/cron/auction-lifecycle \\")
    console.log("  -H 'Authorization: Bearer your-cron-secret'")
}

createTestAuctions()
    .then(() => {
        console.log("\n✅ Test setup complete")
        process.exit(0)
    })
    .catch((error) => {
        console.error("❌ Error:", error)
        process.exit(1)
    })
