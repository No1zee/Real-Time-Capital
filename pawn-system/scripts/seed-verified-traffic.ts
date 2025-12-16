
import { PrismaClient, AssetType, AuctionStatus, ItemStatus, TransactionMethod } from '@prisma/client'
import { faker } from '@faker-js/faker'

const db = new PrismaClient()

// Realistic Image Mappings
const IMAGE_MAPPINGS = {
    VEHICLE: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d", // Sports Car
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf", // Luxury Car
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8", // Mustang
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341", // SUV
    ],
    PROPERTY: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994", // Modern House
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be", // Villa
        "https://images.unsplash.com/photo-1600596542815-27b906a1167d", // Mansion
    ],
    GOODS: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", // Headphones
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // Nike Shoes
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // Watch
    ]
}

async function main() {
    console.log("🚀 Starting Realistic Population...")

    // 1. Create New Customers
    const customers = []
    for (let i = 0; i < 10; i++) {
        const email = faker.internet.email()
        const customer = await db.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: faker.person.fullName(),
                password: "password123",
                role: "CUSTOMER",
                auctionDeposit: 1000,
                updatedAt: new Date()
            }
        })
        customers.push(customer)
        console.log(`Created Customer: ${customer.name}`)
    }

    // 2. Create Items & Auctions
    // Manual cast to avoid TS issues if client generation failed
    const categories: AssetType[] = ["VEHICLE", "PROPERTY", "GOODS"] as any

    for (const category of categories) {
        // Safe access
        const key = category as keyof typeof IMAGE_MAPPINGS
        const images = IMAGE_MAPPINGS[key] || IMAGE_MAPPINGS.GOODS

        for (const imageUrl of images) {
            // Create Item
            const name = category === "VEHICLE" ? faker.vehicle.vehicle() :
                category === "PROPERTY" ? "Luxury Estate" : faker.commerce.productName()

            const item = await db.item.create({
                data: {
                    name: `${name} - ${faker.word.adjective()}`,
                    description: faker.commerce.productDescription(),
                    status: "IN_AUCTION",
                    type: String(category),
                    category: category,
                    valuation: Number(faker.commerce.price({ min: 1000, max: 50000 })),
                    images: JSON.stringify([imageUrl]),
                    userId: customers[0].id,
                    updatedAt: new Date()
                }
            })

            // Create Auction
            const endTime = new Date()
            endTime.setMinutes(endTime.getMinutes() + faker.number.int({ min: 10, max: 120 }))

            const auction = await db.auction.create({
                data: {
                    itemId: item.id,
                    startPrice: Number(faker.commerce.price({ min: 500, max: 2000 })),
                    currentBid: Number(faker.commerce.price({ min: 2100, max: 5000 })),
                    startTime: new Date(),
                    endTime: endTime,
                    status: "ACTIVE",
                    allowAutoExtend: true,
                    buyerLevyPercent: 15,
                    vatPercent: 15,
                    extendedCount: 0,
                    updatedAt: new Date()
                }
            })
            console.log(`Created Auction for ${item.name}`)

            // 3. Simulate Traffic (Bids)
            const bidCount = faker.number.int({ min: 3, max: 15 })
            let currentPrice = Number(auction.currentBid)

            for (let j = 0; j < bidCount; j++) {
                const bidder = customers[faker.number.int({ min: 0, max: customers.length - 1 })]
                const increment = faker.number.int({ min: 10, max: 100 })
                currentPrice += increment

                await db.bid.create({
                    data: {
                        auctionId: auction.id,
                        userId: bidder.id,
                        amount: currentPrice,
                        createdAt: faker.date.recent()
                    }
                })
            }

            // Update final price
            await db.auction.update({
                where: { id: auction.id },
                data: { currentBid: currentPrice, updatedAt: new Date() }
            })
        }
    }

    console.log("✅ Population Complete!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
