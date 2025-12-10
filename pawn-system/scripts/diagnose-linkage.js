
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("DIAGNOSTIC: Checking Linkage for 'Ron'...")

    // 1. Find User
    const user = await prisma.user.findFirst({
        where: { name: { contains: 'Ron', mode: 'insensitive' } }
    })

    if (!user) {
        console.log("❌ User 'Ron' NOT FOUND.")
        return
    }

    console.log(`\nUser Details:`)
    console.log(`- ID: ${user.id}`)
    console.log(`- Name: ${user.name}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- NationalID: ${user.nationalId}  <-- CRITICAL`)

    // 2. Find Customer (by Name or NationalID if user has it)
    let customer
    if (user.nationalId) {
        customer = await prisma.customer.findUnique({ where: { nationalId: user.nationalId } })
    }

    // If not found by ID or no ID, try fuzzy search by name to see what exists
    if (!customer) {
        console.log(`\n(Search by NationalID failed or skipped. Searching by name...)`)
        customer = await prisma.customer.findFirst({
            where: { firstName: { contains: 'Ron', mode: 'insensitive' } },
            include: { Loan: true }
        })
    }

    if (customer) {
        console.log(`\nCustomer Details:`)
        console.log(`- ID: ${customer.id}`)
        console.log(`- Name: ${customer.firstName} ${customer.lastName}`)
        console.log(`- NationalID: ${customer.nationalId}`)
        console.log(`- Email: ${customer.email}`)
        console.log(`- Loan Count: ${customer.Loan ? customer.Loan.length : 0}`)

        if (customer.Loan) {
            customer.Loan.forEach(l => console.log(`  > Loan ${l.id} (${l.status})`))
        }

        // Fix logic if needed
        if (user.nationalId !== customer.nationalId) {
            console.log(`\n❌ MISMATCH: User NationalID (${user.nationalId}) != Customer NationalID (${customer.nationalId})`)
            console.log(`👉 FIXING IT NOW...`)
            await prisma.user.update({
                where: { id: user.id },
                data: { nationalId: customer.nationalId }
            })
            console.log(`✅ User.nationalId updated to ${customer.nationalId}. Dashboard should work.`)
        } else {
            console.log(`\n✅ LINKAGE OK: NationalIDs match.`)
        }

    } else {
        console.log(`\n❌ No matching Customer record found for Ron!`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
