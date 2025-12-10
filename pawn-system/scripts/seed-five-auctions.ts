import { PrismaClient, AssetType } from "@prisma/client"
import * as crypto from 'crypto'

const prisma = new PrismaClient()

const NEW_ITEMS = [
    {
        name: "Rolex Submariner",
        description: "Classic diver's watch, stainless steel, black dial. Excellent condition with original box and papers.",
        category: AssetType.JEWELRY,
        valuation: 8500,
        startPrice: 4000,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Toyota Corolla 2018",
        description: "Reliable sedan, silver, 45,000km. Full service history. Great fuel economy.",
        category: AssetType.VEHICLE,
        valuation: 12000,
        startPrice: 6000,
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Fender Stratocaster",
        description: "American Professional II, Sunburst finish. Maple neck. Includes hard case.",
        category: AssetType.OTHER,
        valuation: 1500,
        startPrice: 700,
        image: "https://images.unsplash.com/photo-1550985543-f47f38aee65d?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Canon EOS R5 Body",
        description: "Professional mirrorless camera, 45MP full-frame sensor, 8K video. Like new.",
        category: AssetType.ELECTRONICS,
        valuation: 3200,
        startPrice: 1500,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Vintage Leather Jacket",
        description: "Genuine brown leather, size L. Distressed look, very stylish and durable.",
        category: AssetType.OTHER,
        valuation: 350,
        startPrice: 100,
        image: "https://images.unsplash.com/photo-1551028919-30164a7ed4af?auto=format&fit=crop&w=800&q=80"
    }
]

async function main() {
    // Ensure a customer and loan exist
    let customer = await prisma.customer.findFirst()
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                id: crypto.randomUUID(),
                firstName: "Seeder",
                lastName: "User",
                nationalId: "SEED-002",
                phoneNumber: "+263770000002",
                address: "Seed Address",
                updatedAt: new Date()
            }
        })
    }

    let loan = await prisma.loan.findFirst({ where: { customerId: customer.id } })
    if (!loan) {
        loan = await prisma.loan.create({
            data: {
                id: crypto.randomUUID(),
                customerId: customer.id,
                principalAmount: 5000,
                interestRate: 10,
                durationDays: 90,
                dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            }
        })
    }

    console.log("Seeding 5 new auctions...")

    for (const itemData of NEW_ITEMS) {
        const item = await prisma.item.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                loanId: loan.id,
                name: itemData.name,
                description: itemData.description,
                valuation: itemData.valuation,
                category: itemData.category,
                images: JSON.stringify([itemData.image]),
                status: "IN_AUCTION"
            }
        })

        // Randomize end times (2 hours to 3 days)
        const duration = 2 + Math.floor(Math.random() * 70)

        await prisma.auction.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                itemId: item.id,
                startPrice: itemData.startPrice,
                startTime: new Date(),
                endTime: new Date(Date.now() + duration * 60 * 60 * 1000),
                status: "ACTIVE"
            }
        })
        console.log(`Created auction: ${itemData.name}`)
    }
    console.log("Done!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
