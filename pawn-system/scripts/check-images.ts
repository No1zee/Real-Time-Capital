
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Item images...")
    const items = await prisma.item.findMany({
        where: {
            status: "IN_AUCTION"
        },
        select: {
            name: true,
            images: true,
            id: true
        }
    })

    console.log(`Found ${items.length} auction items:`)
    items.forEach(item => {
        console.log(`[${item.name}] Images: ${item.images}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
