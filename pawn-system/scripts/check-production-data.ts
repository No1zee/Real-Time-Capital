import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking Database Content...")

    const userCount = await prisma.user.count()
    const auctionCount = await prisma.auction.count()
    const itemCount = await prisma.item.count()

    console.log(`📊 Stats:`)
    console.log(`- Users: ${userCount}`)
    console.log(`- Items: ${itemCount}`)
    console.log(`- Auctions: ${auctionCount}`)

    if (auctionCount > 0) {
        const firstAuction = await prisma.auction.findFirst({
            include: { Item: true }
        })
        console.log(`✅ Sample Auction: ${firstAuction?.Item.name} ($${firstAuction?.currentBid})`)
    } else {
        console.log("❌ No auctions found.")
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
