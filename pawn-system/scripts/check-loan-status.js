
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Verifying Pipeline State (Finding ALL matches)...")
        // Find ALL items with 'Gibson' in the name
        const items = await prisma.item.findMany({
            where: { name: { contains: 'Gibson', mode: 'insensitive' } },
            include: { Loan: true, Auction: true }
        })

        if (items.length === 0) {
            console.log("❌ Item not found (Gibson)")
            return
        }

        console.log(`Found ${items.length} Gibson items.`)

        for (const item of items) {
            console.log(`\n--- Item: ${item.name} (${item.id}) ---`)
            console.log(`   Status: ${item.status}`)

            // Handle Loan Relation
            if (item.Loan && item.Loan.length > 0) {
                const loan = item.Loan[0]
                console.log(`   Loan: ${loan.id}`)
                console.log(`     - Status: ${loan.status}`)
                console.log(`     - Due: ${loan.dueDate}`)
            } else {
                console.log("   Loan: None")
            }

            // Handle Auction Relation
            if (item.Auction) {
                console.log(`   ✅ AUCTION FOUND: ${item.Auction.id}`)
                console.log(`     - Status: ${item.Auction.status}`)
                console.log(`     - Start Price: ${item.Auction.startPrice}`)
                console.log(`     - Current Bid: ${item.Auction.currentBid}`)
            } else {
                console.log("   Auction: None")
            }
        }

    } catch (e) {
        console.error("Error:", e)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
