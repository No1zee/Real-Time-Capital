
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Processing pending loans as ADMIN...")

    // 1. Find Pending Item/Loan
    const loan = await prisma.loan.findFirst({
        where: { status: "PENDING" },
        include: { Item: true, Customer: true },
        orderBy: { createdAt: 'desc' }
    })

    if (!loan) {
        console.log("No pending loans found.")
        return
    }

    const item = loan.Item[0] // Assuming one item per loan for now
    if (!item) {
        console.error("Loan has no item!")
        return
    }

    console.log(`Found Pending Loan: ${loan.id}`)
    console.log(`Item: ${item.name}`)
    console.log(`Customer: ${loan.Customer.firstName}`)
    console.log(`Requested: $${loan.principalAmount}`)

    // 2. Update Valuation (Simulate Admin Valuation)
    const valuationAmount = 35000 // Let's value it slightly higher than request
    const loanOfferAmount = 15000 // Offer 50% or so

    console.log(`\nStep 1: Updating Valuation to $${valuationAmount}...`)
    await prisma.item.update({
        where: { id: item.id },
        data: {
            valuation: valuationAmount,
            status: "VALUED"
        }
    })

    // 3. Create Loan Offer (Simulate Admin Offer)
    console.log(`Step 2: Creating Loan Offer ($${loanOfferAmount})...`)

    // In our system, the "Loan" record created by the user is practically the "Application". 
    // The admin usually "updates" this loan with final terms or creates a "Counter Offer".
    // Looking at the code: createLoanOffer actually creates a NEW loan record if mimicking the exact action?
    // Let's check src/app/actions/loan.ts again.
    // ... createLoanOffer creates a *new* loan record with status "PENDING" but connected to item.
    // BUT the user already created a loan record.

    // To avoid duplicates, for this specific flow where User initiated, we should UPDATE the existing loan with the offered terms.

    await prisma.loan.update({
        where: { id: loan.id },
        data: {
            principalAmount: loanOfferAmount,
            interestRate: 12, // 12%
            durationDays: 30,
            status: "APPROVED", // Or "OFFER_READY" depending on enum. Let's check schema.
            // If schema doesn't have OFFER_READY, let's stick to PENDING but with updated terms, waiting for user acceptance.
            // Actually, let's simply MARK it as APPROVED so the user can "Accept" it.
        }
    })

    console.log("\n✅ Loan Processed & Valued!")
    console.log(`Offer: $${loanOfferAmount} @ 12% for 30 days`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
