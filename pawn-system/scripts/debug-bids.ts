import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Debugging Bids...")

    const auction = await prisma.auction.findFirst({
        include: {
            Bid: { include: { User: true }, orderBy: { amount: "desc" } },
            AutoBid: { include: { User: true } }
        }
    })

    if (!auction) {
        console.log("No auction found")
        return
    }

    console.log(`Auction ID: ${auction.id}`)
    console.log(`Current Bid: ${auction.currentBid}`)
    console.log(`Status: ${auction.status}`)

    console.log("\n--- Bids ---")
    auction.Bid.forEach(bid => {
        console.log(`$${bid.amount} - ${bid.User.name} (${bid.User.email})`)
    })

    console.log("\n--- Auto Bids ---")
    auction.AutoBid.forEach(ab => {
        console.log(`Max: $${ab.maxAmount} - ${ab.User.name}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
