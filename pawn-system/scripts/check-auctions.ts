import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking Auctions...")

    const auctions = await prisma.auction.findMany({
        include: { item: true }
    })

    auctions.forEach(a => {
        console.log(`[${a.status}] ${a.item.name} (ID: ${a.id}) - Practice: ${a.isPractice}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
