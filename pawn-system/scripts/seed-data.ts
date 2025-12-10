import { PrismaClient, AssetType } from "@prisma/client"
import * as crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const userEmail = "jdovi@gmail.com"

    // 1. Credit Wallet
    console.log(`Crediting wallet for ${userEmail}...`)
    try {
        const user = await prisma.user.update({
            where: { email: userEmail },
            data: { walletBalance: { increment: 5000 } }
        })
        console.log(`New Balance: ${user.walletBalance}`)
    } catch (e) {
        console.log(`User ${userEmail} not found, skipping wallet credit.`)
    }

    // 2. Create Dummy Customer & Loan if needed
    let customer = await prisma.customer.findFirst()
    if (!customer) {
        console.log("Creating dummy customer...")
        customer = await prisma.customer.create({
            data: {
                id: crypto.randomUUID(),
                firstName: "Jane",
                lastName: "Doe",
                nationalId: "12-345678-Z-12",
                phoneNumber: "+263771234567",
                address: "123 Borrowdale Rd, Harare",
                updatedAt: new Date()
            }
        })
    }

    let loan = await prisma.loan.findFirst()
    if (!loan) {
        console.log("Creating dummy loan...")
        loan = await prisma.loan.create({
            data: {
                id: crypto.randomUUID(),
                customerId: customer.id,
                principalAmount: 500,
                interestRate: 15,
                durationDays: 30,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            }
        })
    }

    // 3. Create Active Auctions
    console.log("Seeding active auctions...")
    const items = [
        {
            name: "iPhone 14 Pro Max",
            description: "Mint condition, 256GB, Deep Purple. Comes with box and charger.",
            valuation: 900,
            startPrice: 400,
            category: AssetType.ELECTRONICS,
            images: JSON.stringify(["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80"])
        },
        {
            name: "Sony PlayStation 5",
            description: "Disc edition, comes with 2 controllers and God of War Ragnarok.",
            valuation: 600,
            startPrice: 250,
            category: AssetType.ELECTRONICS,
            images: JSON.stringify(["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80"])
        },
        {
            name: "MacBook Air M2",
            description: "Midnight Blue, 8GB RAM, 256GB SSD. Cycle count: 12.",
            valuation: 1100,
            startPrice: 500,
            category: AssetType.ELECTRONICS,
            images: JSON.stringify(["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"])
        }
    ]

    for (const itemData of items) {
        const item = await prisma.item.create({
            data: {
                loanId: loan.id,
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                name: itemData.name,
                description: itemData.description,
                valuation: itemData.valuation,
                category: itemData.category,
                images: itemData.images,
                status: "IN_AUCTION"
            }
        })

        await prisma.auction.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                itemId: item.id,
                startPrice: itemData.startPrice,
                startTime: new Date(),
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ends in 24h
                status: "ACTIVE"
            }
        })
        console.log(`Created auction for: ${itemData.name}`)
    }

    console.log("Seeding complete!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
