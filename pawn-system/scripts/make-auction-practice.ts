import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔄 Converting an auction to Practice Mode...")

    const auction = await prisma.auction.findFirst({
        where: { status: "ACTIVE" },
        include: { item: true }
    })

    if (!auction) {
        console.log("❌ No active auction found.")
        return
    }

    await prisma.auction.update({
        where: { id: auction.id },
        data: { isPractice: true }
    })

    await prisma.item.update({
        where: { id: auction.itemId },
        data: { name: "Practice Rolex (Converted)" }
    })

    console.log(`✅ Converted Auction ${auction.id} to Practice Mode.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
