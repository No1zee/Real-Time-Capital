import { PrismaClient, UserRole, ItemStatus, AuctionStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting Production Seeding...")

    // 1. Create Users
    const password = await bcrypt.hash("password123", 10)

    const users = [
        { email: "admin@example.com", name: "Admin User", role: UserRole.ADMIN },
        { email: "staff@example.com", name: "Staff User", role: UserRole.STAFF },
        { email: "customer@example.com", name: "John Doe", role: UserRole.CUSTOMER },
    ]

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password,
                role: u.role,
                verificationStatus: "VERIFIED",
                walletBalance: 1000, // Give them some money to bid
                practiceBalance: 50000,
            },
        })
        console.log(`👤 User ensured: ${user.email} (${user.role})`)
    }

    // 2. Create Items & Auctions
    const items = [
        {
            name: "Rolex Submariner Date",
            description: "Classic diver's watch, excellent condition. Original box and papers included.",
            category: "Watches",
            valuation: 12000,
            startPrice: 8500,
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "MacBook Pro M3 Max",
            description: "16-inch, Space Black, 1TB SSD, 36GB Unified Memory. Barely used.",
            category: "Electronics",
            valuation: 3500,
            startPrice: 2000,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Gibson Les Paul Standard",
            description: "2020 Model, Heritage Cherry Sunburst. Includes hard shell case.",
            category: "Musical Instruments",
            valuation: 2800,
            startPrice: 1500,
            image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Gold Diamond Ring (1.5ct)",
            description: "18k Gold band with a stunning 1.5 carat princess cut diamond.",
            category: "Jewelry",
            valuation: 5000,
            startPrice: 3200,
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
        },
        {
            name: "Sony A7IV Camera Kit",
            description: "Includes 24-70mm GM lens. Perfect for professional photography.",
            category: "Electronics",
            valuation: 4200,
            startPrice: 2800,
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
        }
    ]

    for (const i of items) {
        // Create Item
        const item = await prisma.item.create({
            data: {
                name: i.name,
                description: i.description,
                category: i.category,
                valuation: i.valuation,
                status: ItemStatus.IN_AUCTION, // Correct Enum
                images: JSON.stringify([i.image]),
                location: "Main Vault",
            }
        })

        // Create Auction
        const dayOffset = Math.floor(Math.random() * 5) + 1 // Ends in 1-5 days
        await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice: i.startPrice,
                currentBid: i.startPrice, // Start at base price
                startTime: new Date(),
                endTime: new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000),
                status: AuctionStatus.ACTIVE,
            }
        })
        console.log(`🔨 Auction created for: ${item.name}`)
    }

    console.log("✅ Seeding Complete!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
