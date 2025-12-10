
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper to get a realistic image based on keywords
function getUnsplashUrl(query) {
    const keywords = query.replace(/ /g, ',')
    return `https://source.unsplash.com/600x400/?${keywords}`
    // Note: source.unsplash.com is deprecated/unreliable sometimes. 
    // Let's use specific IDs or specific reliable URLs for the key items requested.
}

const SPECIFIC_IMAGES = {
    "Oriental": "https://images.unsplash.com/photo-1601121141461-9f6644cb8707?q=80&w=600&auto=format&fit=crop", // Jewelry/Ornaments
    "iPhone": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop", // iPhone 15/Pro
    "Tasty": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop", // Collectible/Toy
    "Rolex": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop", // Watch
    "Diamond": "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=600&auto=format&fit=crop", // Diamond Ring
    "Gold": "https://images.unsplash.com/photo-1610375461490-67981315250d?q=80&w=600&auto=format&fit=crop", // Gold
    "Electronics": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop",
    "Jewelry": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
    "Vehicles": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"
}

function getImageForName(name, category) {
    // Check specific keywords first
    for (const [key, url] of Object.entries(SPECIFIC_IMAGES)) {
        if (name.includes(key)) return url
    }
    // Fallback to category
    if (SPECIFIC_IMAGES[category]) return SPECIFIC_IMAGES[category]

    // Generic fallback
    return "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=600&auto=format&fit=crop" // Pawn shop / generic item
}

async function main() {
    console.log("Populating REALISTIC images for all auctions...")

    // 1. Get all items that are in an auction or recently sold
    // 1. Get all items matching our keywords or generic fetch
    // Simplified query to avoid Prisma validator issues with mixed types in OR
    const items = await prisma.item.findMany({
        include: { Auction: true }
    })

    console.log(`Checking ${items.length} items...`)

    for (const item of items) {
        let currentImages = []
        try {
            currentImages = JSON.parse(item.images)
        } catch (e) {
            currentImages = []
        }

        // Determine if we should update:
        // - No images
        // - Images contain "placehold.co" (our placeholder service)
        // - Specifically requested items (Oriental, iPhone, Tasty)
        const isPlaceholder = currentImages.some(img => img.includes("placehold.co"))
        const isEmpty = !Array.isArray(currentImages) || currentImages.length === 0
        const isRequested = ["Oriental", "iPhone", "Tasty"].some(key => item.name.includes(key))

        if (isEmpty || isPlaceholder || isRequested) {
            const newImage = getImageForName(item.name, item.category)

            await prisma.item.update({
                where: { id: item.id },
                data: {
                    images: JSON.stringify([newImage])
                }
            })
            console.log(`✅ Updated: ${item.name} -> ${newImage.substring(0, 50)}...`)
        } else {
            console.log(`Skipped: ${item.name} (Already has valid images)`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
