import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const auction = await prisma.auction.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        include: { bids: { include: { user: true } } }
    })

    if (!auction) {
        console.log("No active auction found.")
        return
    }

    console.log(`Auction: ${auction.id}`)
    console.log(`Current Bid: ${auction.currentBid}`)
    console.log("Bids:")
    auction.bids.forEach(bid => {
        console.log(`- $${bid.amount} by ${bid.user.name} (${bid.user.email})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
