
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Simulating Loan Default...")

    // 1. Find the ACTIVE loan for Ron/Test Item
    // 1. Find the Item first (easier to debug)
    // 1. Find the Item first (easier to debug)
    const item = await prisma.item.findFirst({
        where: { name: 'Vintage Gibson Guitar' },
        include: { Loan: true }
    })

    if (!item) {
        console.log("❌ Item 'Vintage Gibson Guitar' not found.")
        return
    }

    if (!item.Loan && !item.loanId) {
        console.log("❌ Item found but no Loan linked.")
        return
    }

    // Get the loan
    const loan = item.Loan || await prisma.loan.findUnique({ where: { id: item.loanId } })


    if (loan) {
        console.log(`Found Loan: ${loan.id} | Status: ${loan.status}`)
    }

    if (!loan) {
        console.log("❌ No ACTIVE loan found for 'Vintage Gibson Guitar'.")
        console.log("Please ensure you accepted the offer in the dashboard.")
        return
    }

    console.log(`Found Active Loan: ${loan.id}`)
    console.log(`Current Due Date: ${loan.dueDate}`)

    // 2. Update Due Date to 2 days ago (Past)
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 2)

    await prisma.loan.update({
        where: { id: loan.id },
        data: {
            dueDate: pastDate
        }
    })

    console.log(`✅ Updated Due Date to: ${pastDate.toISOString()} (OVERDUE)`)

    // 3. (Optional) Run the check logic if we had a dedicated script or endpoint
    // For now, we will manually trigger the transition to confirm the logic works,
    // mimicking what the cron job would do.

    console.log("Transitioning to DEFAULTED and Item to IN_AUCTION...")

    await prisma.$transaction([
        prisma.loan.update({
            where: { id: loan.id },
            data: { status: 'DEFAULTED' }
        }),
        prisma.item.update({
            where: { id: item.id },
            data: { status: 'IN_AUCTION' }
        })
    ])

    console.log("✅ Loan is DEFAULTED.")
    console.log("✅ Item is IN_AUCTION queue.")
    console.log("Check the 'Auctions' page (or pending auctions list) to verify.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
