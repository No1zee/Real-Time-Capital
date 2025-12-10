
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Finding the DEFAULTED loan and its item...")

    // Find the defaulted loan
    const loan = await prisma.loan.findFirst({
        where: { status: 'DEFAULTED' },
        include: { Item: true }
    })

    if (!loan) {
        console.log("❌ No DEFAULTED loan found")
        return
    }

    console.log(`✅ Found DEFAULTED Loan: ${loan.id}`)
    console.log(`   Items linked: ${loan.Item.length}`)

    for (const item of loan.Item) {
        console.log(`\n   Item: ${item.name} (${item.id})`)
        console.log(`   Status: ${item.status}`)

        // Check if this item has an auction
        const auction = await prisma.auction.findUnique({
            where: { itemId: item.id }
        })

        if (auction) {
            console.log(`   ✅ Auction: ${auction.id} (${auction.status})`)
        } else {
            console.log(`   ❌ No Auction for this item - NEEDS CREATION`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
