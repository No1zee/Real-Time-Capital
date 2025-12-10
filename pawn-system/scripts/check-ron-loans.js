
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking loans for Ron...")

    // Find Ron first
    const ron = await prisma.user.findFirst({
        where: { name: { contains: 'Ron', mode: 'insensitive' } }
    })

    if (!ron) {
        console.log("Ron not found!")
        return
    }

    console.log(`Found User: ${ron.name} (${ron.id})`)

    // Find loans linked to User OR linked to Customer with same details
    const customer = await prisma.customer.findFirst({
        where: { nationalId: ron.nationalId || "UNDEFINED" }
    })

    if (customer) {
        console.log(`Found Related Customer: ${customer.firstName} ${customer.lastName} (${customer.id})`)
    }

    const loans = await prisma.loan.findMany({
        where: {
            OR: [
                { userId: ron.id },
                { customerId: customer?.id }
            ]
        },
        include: { Item: true }
    })

    console.log(`\nTotal Loans Found: ${loans.length}`)
    loans.forEach(l => {
        console.log(`- Loan ${l.id} | Status: ${l.status} | Amount: ${l.principalAmount}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
