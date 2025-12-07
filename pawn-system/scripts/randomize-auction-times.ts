import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Fetching active auctions...")
    const auctions = await prisma.auction.findMany({
        where: { status: "ACTIVE" }
    })

    console.log(`Found ${auctions.length} active auctions. Randomizing end times...`)

    for (const auction of auctions) {
        // Random duration between 5 minutes and 7 days
        // Min: 5 * 60 * 1000 = 300,000 ms
        // Max: 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms

        // Let's create a distribution:
        // 20% ending soon (5 mins - 2 hours)
        // 30% ending today (2 hours - 24 hours)
        // 50% ending later (1 day - 7 days)

        let durationMs = 0
        const rand = Math.random()

        if (rand < 0.2) {
            // Ending soon: 5m to 2h
            durationMs = 300000 + Math.random() * (7200000 - 300000)
        } else if (rand < 0.5) {
            // Ending today: 2h to 24h
            durationMs = 7200000 + Math.random() * (86400000 - 7200000)
        } else {
            // Ending later: 1d to 7d
            durationMs = 86400000 + Math.random() * (604800000 - 86400000)
        }

        const newEndTime = new Date(Date.now() + durationMs)

        await prisma.auction.update({
            where: { id: auction.id },
            data: { endTime: newEndTime }
        })

        process.stdout.write(".")
    }

    console.log("\nDone! Auction times randomized.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
