
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Find the most recent item
    const item = await prisma.item.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!item) {
        console.log("No items found.")
        return
    }

    console.log(`Updating item ${item.name} (${item.id}) to OVERDUE`)

    await prisma.item.update({
        where: { id: item.id },
        data: { status: "OVERDUE" }
    })

    console.log("Done.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
