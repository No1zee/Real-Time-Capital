
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Fixing missing images...")

    const updates = [
        {
            search: "Oriental",
            image: "https://placehold.co/600x400/png?text=Oriental+Jewelry"
        },
        {
            search: "iPhone",
            image: "https://placehold.co/600x400/png?text=iPhone+Pro+Max"
        },
        {
            search: "Tasty",
            image: "https://placehold.co/600x400/png?text=Tasty+Collectibles"
        }
    ]

    for (const update of updates) {
        const items = await prisma.item.findMany({
            where: {
                name: { contains: update.search, mode: 'insensitive' }
            }
        })

        console.log(`Found ${items.length} items matching '${update.search}'`)

        for (const item of items) {
            // Check if parsing fails or if it's empty/null
            let needsUpdate = false
            try {
                const parsed = JSON.parse(item.images)
                if (!Array.isArray(parsed) || parsed.length === 0) needsUpdate = true
            } catch (e) {
                needsUpdate = true
            }

            // Also update if it's just "[]" or empty string
            if (!item.images || item.images === "[]" || item.images === "") needsUpdate = true;

            if (needsUpdate || true) { // Force update to ensure quality image
                await prisma.item.update({
                    where: { id: item.id },
                    data: {
                        images: JSON.stringify([update.image])
                    }
                })
                console.log(`✅ Updated image for: ${item.name}`)
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
