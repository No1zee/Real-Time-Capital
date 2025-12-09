import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const auction = await prisma.auction.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        include: { Bid: { include: { User: true } } }
    })

    if (!auction) {
        console.log("No active auction found.")
        return
    }

    console.log(`Auction: ${auction.id}`)
    console.log(`Current Bid: ${auction.currentBid}`)
    console.log("Bids:")
    auction.Bid.forEach(bid => {
        console.log(`- $${bid.amount} by ${bid.User.name} (${bid.User.email})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
