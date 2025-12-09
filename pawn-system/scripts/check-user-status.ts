import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const searchTerm = "John" // Searching for John Dovi

    console.log(`Searching for users matching "${searchTerm}"...`)
    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: searchTerm
            }
        },
        include: {
            Bid: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { Auction: { include: { Item: true } } }
            },
            transactions: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (users.length === 0) {
        console.log("No users found.")
    } else {
        for (const user of users) {
            console.log(`\nUser: ${user.name} (${user.email})`)
            console.log(`ID: ${user.id}`)
            console.log(`Role: ${user.role}`)
            console.log(`Wallet Balance: ${user.walletBalance}`)

            console.log(`\nRecent Bids (${user.Bid.length}):`)
            if (user.Bid.length === 0) {
                console.log("  No bids placed.")
            } else {
                user.Bid.forEach(b => {
                    console.log(`  - $${b.amount} on ${b.Auction.Item.name} (${b.Auction.status})`)
                })
            }

            console.log(`\nRecent Transactions:`)
            user.transactions.forEach(t => {
                console.log(`  - ${t.type}: ${t.amount} (${t.status})`)
            })
        }
    }

    console.log("\n--- System Status ---")
    const activeAuctions = await prisma.auction.findMany({
        where: { status: "ACTIVE" },
        include: { Item: true }
    })
    console.log(`Total Active Auctions in System: ${activeAuctions.length}`)
    activeAuctions.forEach(a => {
        console.log(`  - [ACTIVE] ${a.Item.name} (Current Bid: ${a.currentBid || a.startPrice})`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
