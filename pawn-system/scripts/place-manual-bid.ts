import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const email = "alex1733470843@example.com"
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        console.error("User not found")
        return
    }

    const auction = await prisma.auction.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" }
    })

    if (!auction) {
        console.error("No active auction found")
        return
    }

    // Place a bid higher than current
    const currentBid = Number(auction.currentBid || auction.startPrice)
    const myBid = currentBid + 10

    console.log(`Placing bid of ${myBid} for ${user.name}...`)

    await prisma.$transaction([
        prisma.bid.create({
            data: {
                amount: myBid,
                userId: user.id,
                auctionId: auction.id
            }
        }),
        prisma.auction.update({
            where: { id: auction.id },
            data: { currentBid: myBid }
        })
    ])

    console.log("✅ Bid placed!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
