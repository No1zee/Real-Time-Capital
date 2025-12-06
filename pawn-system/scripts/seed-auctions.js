
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Clearing existing auctions and items...")
    await prisma.bid.deleteMany({})
    await prisma.auction.deleteMany({})
    // Only delete items created by this script (identified by category/name potentially, but for now let's just wipe for demo)
    // Or better, just create new ones and we'll ignore the old ones in the UI if we filter by status.
    // But to keep it clean, let's delete all items that are in AUCTION status.
    await prisma.item.deleteMany({ where: { status: "AUCTION" } })

    console.log("Seeding auctions with images...")

    const items = [
        {
            name: "Vintage Rolex Watch",
            description: "1980s Rolex Datejust, good condition, minor scratches.",
            category: "Jewelry",
            brand: "Rolex",
            model: "Datejust",
            valuation: 4500.00,
            status: "AUCTION",
            startPrice: 3000.00,
            image: "https://placehold.co/600x400/png?text=Rolex+Watch"
        },
        {
            name: "MacBook Pro M2",
            description: "14-inch, 16GB RAM, 512GB SSD. Like new.",
            category: "Electronics",
            brand: "Apple",
            model: "MacBook Pro",
            valuation: 1800.00,
            status: "AUCTION",
            startPrice: 1200.00,
            image: "https://placehold.co/600x400/png?text=MacBook+Pro"
        },
        {
            name: "Gibson Les Paul Guitar",
            description: "2015 Standard, Sunburst finish. Includes hard case.",
            category: "Musical Instruments",
            brand: "Gibson",
            model: "Les Paul Standard",
            valuation: 2200.00,
            status: "AUCTION",
            startPrice: 1500.00,
            image: "https://placehold.co/600x400/png?text=Gibson+Les+Paul"
        },
        {
            name: "Sony A7III Camera",
            description: "Body only. Low shutter count.",
            category: "Electronics",
            brand: "Sony",
            model: "A7III",
            valuation: 1400.00,
            status: "AUCTION",
            startPrice: 900.00,
            image: "https://placehold.co/600x400/png?text=Sony+Camera"
        },
        {
            name: "Gold Necklace 18k",
            description: "20g solid gold chain.",
            category: "Jewelry",
            brand: "Generic",
            model: "N/A",
            valuation: 1200.00,
            status: "AUCTION",
            startPrice: 1000.00,
            image: "https://placehold.co/600x400/png?text=Gold+Necklace"
        }
    ]

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 2) // Ends in 2 days

    for (const itemData of items) {
        // Create Item
        const item = await prisma.item.create({
            data: {
                name: itemData.name,
                description: itemData.description,
                category: itemData.category,
                brand: itemData.brand,
                model: itemData.model,
                valuation: itemData.valuation,
                status: itemData.status,
                images: JSON.stringify([itemData.image])
            }
        })

        // Create Auction
        await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice: itemData.startPrice,
                startTime: yesterday,
                endTime: tomorrow,
                status: "ACTIVE",
                currentBid: itemData.startPrice
            }
        })

        console.log(`Created auction for ${item.name}`)
    }

    console.log("Seeding complete.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
