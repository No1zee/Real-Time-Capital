
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking result for 'Rolex Submariner (Winner Test)'...")

    // 1. Get Ron
    // 1. Get Ron (by name, as email might vary)
    const ron = await prisma.user.findFirst({
        where: { name: { contains: "Ron", mode: 'insensitive' } }
    })

    if (!ron) {
        console.log("❌ User Ron Choga not found.")
        return
    }

    // 2. Get Item
    const item = await prisma.item.findFirst({
        where: { name: "Rolex Submariner (Winner Test)" },
        include: { Auction: true }
    })

    if (!item) {
        console.log("❌ Item not found.")
        return
    }

    console.log(`\nItem: ${item.name}`)
    console.log(`Item Status: ${item.status}`)
    console.log(`Auction Status: ${item.Auction ? item.Auction.status : 'No Auction'}`)

    console.log(`\n--- OWNERSHIP CHECK ---`)
    console.log(`Ron's ID:   ${ron.id}`)
    console.log(`Item Owner: ${item.userId}`)

    if (item.userId === ron.id) {
        console.log(`\n✅ MATCH! Ron is the owner. He WON the auction.`)
    } else {
        console.log(`\n❌ MISMATCH. Ron is NOT the owner.`)
        if (item.userId === null) console.log("   (Item has no owner)")
        else console.log("   (Item owned by someone else)")
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
