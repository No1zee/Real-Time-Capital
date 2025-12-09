import { PrismaClient } from "@prisma/client"
import * as crypto from 'crypto'

const prisma = new PrismaClient()

const ADJECTIVES = ["Vintage", "Brand New", "Gently Used", "Rare", "Antique", "Custom", "Luxury", "Professional", "Compact", "Heavy Duty", "Limited Edition", "Restored"]
const NOUNS = [
    { name: "iPhone 13", cat: "Electronics", val: 600 },
    { name: "MacBook Pro", cat: "Electronics", val: 1200 },
    { name: "Rolex Submariner", cat: "Jewelry", val: 8000 },
    { name: "Diamond Ring", cat: "Jewelry", val: 2500 },
    { name: "Toyota Corolla", cat: "Vehicles", val: 5000 },
    { name: "Honda Civic", cat: "Vehicles", val: 4500 },
    { name: "PS5 Console", cat: "Gaming", val: 500 },
    { name: "Xbox Series X", cat: "Gaming", val: 450 },
    { name: "Fender Stratocaster", cat: "Musical Instruments", val: 1000 },
    { name: "Gibson Les Paul", cat: "Musical Instruments", val: 2000 },
    { name: "Power Drill Set", cat: "Tools", val: 150 },
    { name: "Designer Handbag", cat: "Fashion", val: 1200 },
    { name: "Leather Jacket", cat: "Fashion", val: 300 },
    { name: "Comic Book Collection", cat: "Collectibles", val: 500 },
    { name: "Oil Painting", cat: "Art", val: 800 },
    { name: "Oak Dining Table", cat: "Furniture", val: 600 },
    { name: "Samsung Galaxy S23", cat: "Electronics", val: 700 },
    { name: "Canon EOS R5", cat: "Electronics", val: 3500 },
    { name: "Gold Necklace", cat: "Jewelry", val: 1200 },
    { name: "Mountain Bike", cat: "Vehicles", val: 800 },
    { name: "Drone with 4K Camera", cat: "Electronics", val: 900 },
    { name: "Smart Watch", cat: "Electronics", val: 250 },
    { name: "Gaming PC", cat: "Gaming", val: 1500 },
    { name: "Leather Sofa", cat: "Furniture", val: 1000 },
    { name: "Persian Rug", cat: "Furniture", val: 1500 },
]

const IMAGES = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80", // Phone
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", // Laptop
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80", // Watch
    "https://images.unsplash.com/photo-1605100804763-eb2fc603675d?auto=format&fit=crop&w=800&q=80", // Ring
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // Car
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", // Console
    "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=800&q=80", // Guitar
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80", // Tools
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", // Bag
    "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80", // Art
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", // Headphones
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", // Shoes
]

async function main() {
    // Ensure a customer and loan exist
    let customer = await prisma.customer.findFirst()
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName: "Bulk",
                lastName: "Seeder",
                nationalId: "BULK-SEED-001",
                phoneNumber: "+263770000000",
                address: "Bulk Address",
                updatedAt: new Date()
            }
        })
    }

    let loan = await prisma.loan.findFirst({ where: { customerId: customer.id } })
    if (!loan) {
        loan = await prisma.loan.create({
            data: {
                customerId: customer.id,
                principalAmount: 10000,
                interestRate: 10,
                durationDays: 365,
                dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            }
        })
    }

    console.log("Seeding 50 auctions...")

    for (let i = 0; i < 50; i++) {
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
        const image = IMAGES[Math.floor(Math.random() * IMAGES.length)]

        const name = `${adj} ${noun.name}`
        const valuation = noun.val * (0.8 + Math.random() * 0.4) // +/- 20%
        const startPrice = valuation * 0.4 // Start at 40% of value

        const item = await prisma.item.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                loanId: loan.id,
                name: name,
                description: `A ${adj.toLowerCase()} ${noun.name} in excellent condition. Great opportunity for collectors and users alike.`,
                valuation: Math.floor(valuation),
                category: noun.cat,
                images: JSON.stringify([image]),
                status: "IN_AUCTION"
            }
        })

        // Randomize end times (1 to 7 days from now)
        const duration = 24 + Math.floor(Math.random() * 144) // 1-6 days

        await prisma.auction.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                itemId: item.id,
                startPrice: Math.floor(startPrice),
                startTime: new Date(),
                endTime: new Date(Date.now() + duration * 60 * 60 * 1000),
                status: "ACTIVE"
            }
        })

        process.stdout.write(".")
    }
    console.log("\nDone! Created 50 active auctions.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
