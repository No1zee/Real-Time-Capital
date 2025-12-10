
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Monitoring for new PENDING loans...")
    const startCount = await prisma.loan.count({ where: { status: "PENDING" } })
    console.log(`Current Pending Loans: ${startCount}`)

    let ticks = 0
    const maxTicks = 60 // 5 minutes (every 5s)

    const interval = setInterval(async () => {
        ticks++
        process.stdout.write(".")

        const count = await prisma.loan.count({ where: { status: "PENDING" } })

        if (count > startCount) {
            console.log("\n\n✅ New Loan Detected!")

            // Get the latest one
            const latest = await prisma.loan.findFirst({
                where: { status: "PENDING" },
                orderBy: { createdAt: 'desc' },
                include: { Item: true, Customer: true }
            })

            console.log(`ID: ${latest.id}`)
            console.log(`Item: ${latest.Item ? latest.Item.name : 'Unknown'}`)
            console.log(`Amount Requested: $${latest.principalAmount}`)
            console.log(`Customer: ${latest.Customer ? latest.Customer.firstName : 'Unknown'}`)

            clearInterval(interval)
            process.exit(0)
        }

        if (ticks >= maxTicks) {
            console.log("\nTimeout waiting for loan.")
            clearInterval(interval)
            process.exit(0)
        }
    }, 5000)
}

main()
    .catch(console.error)
// Do not disconnect immediately, let interval run
