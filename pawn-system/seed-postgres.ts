
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2))
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]

const generateName = () => `${randomItem(firstNames)} ${randomItem(lastNames)}`
const generateEmail = (name: string) => `${name.toLowerCase().replace(' ', '.')}@example.com`
const generatePhone = () => `+2637${randomInt(10000000, 99999999)}`

const getImageForCategory = (category: string) => {
    const images: Record<string, string[]> = {
        JEWELRY: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1617038224558-28ad7a7467de?auto=format&fit=crop&q=80&w=1000"
        ],
        ELECTRONICS: [
            "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1588872657578-a3d2e31d9a5b?auto=format&fit=crop&q=80&w=1000"
        ],
        VEHICLE: [
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000"
        ],
        COLLECTIBLE: [
            "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1592657963242-491104e1ecca?auto=format&fit=crop&q=80&w=1000"
        ],
        FURNITURE: [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1592078615290-033ee584e276?auto=format&fit=crop&q=80&w=1000"
        ],
        OTHER: [
            "https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000"
        ]
    }
    const pool = images[category] || images.OTHER
    return JSON.stringify([randomItem(pool)])
}

async function main() {
    console.log("🌱 Starting fresh seed for presentation...")

    // Cleanup existing data to prevent duplicates (Preserving Users/Sessions to keep you logged in)
    console.log("🧹 Cleaning up old data...")
    try {
        await prisma.watchlist.deleteMany()
        await prisma.autoBid.deleteMany()
        await prisma.bid.deleteMany()
        await prisma.payment.deleteMany()
        await prisma.rating.deleteMany()
        await prisma.dispute.deleteMany()
        await prisma.auction.deleteMany()
        await prisma.item.deleteMany()
        await prisma.loan.deleteMany()
        await prisma.customer.deleteMany()
        await prisma.transaction.deleteMany()
        await prisma.article.deleteMany()
        await prisma.notification.deleteMany()
        await prisma.ticketMessage.deleteMany()
        await prisma.ticket.deleteMany()
        console.log("✨ Database cleared (Users preserved).")
    } catch (e) {
        console.warn("⚠️ Cleanup warning (some tables might be empty):", e)
    }

    // 1. Create Users (15 users)
    console.log("Creating Users...")
    const users = []
    // Admin
    const adminEmail = "admin@cashpoint.co.zw"
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Admin User",
            email: adminEmail,
            role: "ADMIN",
            permissions: "ALL",
            walletBalance: 10000
        }
    })
    users.push(admin)

    for (let i = 0; i < 15; i++) {
        const name = generateName()
        const email = generateEmail(name)
        try {
            const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    name,
                    email,
                    phoneNumber: generatePhone(),
                    role: "CUSTOMER",
                    walletBalance: randomFloat(100, 5000),
                    practiceBalance: 50000,
                    verificationStatus: randomItem(["VERIFIED", "VERIFIED", "PENDING", "UNVERIFIED"]),
                    updatedAt: new Date(),
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    idImage: "https://images.unsplash.com/photo-1563260797-cb5cd70254c8?auto=format&fit=crop&q=80&w=500" // Generic ID placeholder
                }
            })
            users.push(user)
        } catch (e) {
            console.log(`Skipping duplicate user: ${email}`)
        }
    }

    // 2. Customers (for Loans)
    console.log("Creating Customers...")
    const customers = []
    for (let i = 0; i < 10; i++) {
        const firstName = randomItem(firstNames)
        const lastName = randomItem(lastNames)
        const nationalId = `${randomInt(10, 99)}-${randomInt(100000, 999999)}P${randomInt(10, 99)}`

        try {
            const customer = await prisma.customer.create({
                data: {
                    firstName,
                    lastName,
                    nationalId,
                    phoneNumber: generatePhone(),
                    address: "123 Samora Machel Ave, Harare",
                    creditScore: randomInt(300, 850),
                    updatedAt: new Date()
                }
            })
            customers.push(customer)
        } catch (e) {
            // likely unique constraint on nationalId, ignore
        }
    }

    // Fetch all customers if creating failed (so we have a pool)
    const allCustomers = await prisma.customer.findMany()

    // 3. Loans & Items (20 Loans)
    console.log("Creating Loans & Items...")
    const loanStatuses = ["ACTIVE", "ACTIVE", "ACTIVE", "PENDING", "APPROVED", "COMPLETED", "DEFAULTED"]
    const itemTypes = [
        { name: "Gold Necklace", category: "JEWELRY", val: 500 },
        { name: "iPhone 14 Pro", category: "ELECTRONICS", val: 800 },
        { name: "Toyota Corolla", category: "VEHICLE", val: 5000 },
        { name: "Diamond Ring", category: "JEWELRY", val: 2000 },
        { name: "Gaming Laptop", category: "ELECTRONICS", val: 1200 },
        { name: "Antique Watch", category: "COLLECTIBLE", val: 3000 },
        { name: "Leather Sofa", category: "FURNITURE", val: 400 },
        { name: "PS5 Console", category: "ELECTRONICS", val: 450 }
    ]

    for (let i = 0; i < 25; i++) {
        try {
            const customer = randomItem(allCustomers)
            if (!customer) continue;

            const itemBase = randomItem(itemTypes)
            const principal = itemBase.val * randomFloat(0.4, 0.7)
            const status = randomItem(loanStatuses) as any

            // Determine item status based on loan status
            let itemStatus = "PENDING_VALUATION"
            if (status === "ACTIVE") itemStatus = "PAWNED"
            if (status === "DEFAULTED") itemStatus = "IN_AUCTION"
            if (status === "COMPLETED") itemStatus = "REDEEMED"


            await prisma.loan.create({
                data: {
                    customerId: customer.id,
                    principalAmount: principal,
                    interestRate: 15,
                    durationDays: 30,
                    status: status,
                    startDate: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(),
                    Item: {
                        create: {
                            name: itemBase.name,
                            category: itemBase.category as any,
                            description: `A nice ${itemBase.name.toLowerCase()} in good condition.`,
                            valuation: itemBase.val,
                            status: itemStatus as any,
                            updatedAt: new Date(),
                            images: getImageForCategory(itemBase.category)
                        }
                    }
                }
            })
        } catch (e: any) {
            console.error(`Failed to create loan/item ${i}:`, e.message)
        }
    }

    // 4. Auctions (15 total: ~7 Active, ~3 Scheduled, ~5 Ended)
    console.log("Creating Auctions...")
    const auctionItems = [
        { name: "Rolex Submariner", val: 8500, cat: "JEWELRY", img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000" }, // Rolex Watch
        { name: "MacBook Pro M2", val: 1800, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000" }, // MacBook
        { name: "Ford Ranger 2018", val: 22000, cat: "VEHICLE", img: "https://images.unsplash.com/photo-1626838321481-987508cb50df?auto=format&fit=crop&q=80&w=1000" }, // Ford Ranger/Truck
        { name: "Gold Bullion 1oz", val: 2100, cat: "COLLECTIBLE", img: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=1000" }, // Gold Bar
        { name: "Samsung S23 Ultra", val: 900, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1000" }, // Samsung Phone
        { name: "Vintage Guitar", val: 1500, cat: "COLLECTIBLE", img: "https://images.unsplash.com/photo-1550985543-f4423c8d361e?auto=format&fit=crop&q=80&w=1000" }, // Guitar
        { name: "Generator 5kVA", val: 600, cat: "OTHER", img: "https://images.unsplash.com/photo-1574360773950-70438cf5668d?auto=format&fit=crop&q=80&w=1000" }, // Generator
        { name: "Office Desk Set", val: 300, cat: "FURNITURE", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000" }, // Office Desk
        { name: "Canon R5 Camera", val: 3200, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000" }, // Camera
        { name: "Drone DJI Mavic", val: 800, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1000" }, // Drone
        { name: "iPad Pro", val: 900, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1000" }, // iPad
        { name: "Xbox Series X", val: 450, cat: "ELECTRONICS", img: "https://images.unsplash.com/photo-1621259182902-480c0fa34f36?auto=format&fit=crop&q=80&w=1000" } // Xbox
    ]

    // Create standalone items for auctions
    for (const data of auctionItems) {
        // Create Item first
        const item = await prisma.item.create({
            data: {
                name: data.name,
                category: data.cat as any,
                description: "Seized item ready for auction.",
                valuation: data.val,
                status: "IN_AUCTION",
                updatedAt: new Date(),
                images: JSON.stringify([data.img]) // Use specific image
            }
        })

        // Determine Auction Status
        const rand = Math.random()
        let status = "ACTIVE"
        let startTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // started yesterday
        let endTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // ends tomorrow

        if (rand > 0.7) {
            status = "ENDED"
            startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            endTime = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        } else if (rand > 0.85) {
            status = "SCHEDULED"
            startTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
            endTime = new Date(Date.now() + 48 * 60 * 60 * 1000)
        }

        const startPrice = data.val * 0.5

        await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice,
                currentBid: status === "ACTIVE" ? startPrice + randomInt(10, 500) : (status === "ENDED" ? data.val : startPrice),
                status: status as any,
                startTime,
                endTime,
                type: "ONLINE",
                updatedAt: new Date()
            }
        })
    }

    // 5. Transactions (Simulate activity)
    console.log("Creating Transactions...")
    const allUsers = await prisma.user.findMany()
    for (const u of allUsers) {
        // Deposit
        await prisma.transaction.create({
            data: {
                userId: u.id,
                amount: randomFloat(100, 1000),
                type: "DEPOSIT",
                status: "COMPLETED",
                method: "ECOCASH",
                reference: `ECO-${randomInt(10000, 99999)}`
            }
        })

        // Random Payment or Hold
        if (Math.random() > 0.5) {
            await prisma.transaction.create({
                data: {
                    userId: u.id,
                    amount: randomFloat(50, 200),
                    type: "PAYMENT",
                    status: "COMPLETED",
                    method: "CASH",
                    reference: `INV-${randomInt(1000, 9999)}`
                }
            })
        }
    }

    // 6. Articles (News/CMS)
    console.log("Creating Articles...")
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } })
    if (adminUser) {
        const articles = [
            { title: "Understanding Pawn Loans", cat: "Education", img: "https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?auto=format&fit=crop&q=80&w=1000" },
            { title: "Top 5 Items to Pawn", cat: "Tips", img: "https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=1000" },
            { title: "How Auctions Work", cat: "Guides", img: "https://images.unsplash.com/photo-1550505096-26796987f66e?auto=format&fit=crop&q=80&w=1000" }
        ]

        for (const art of articles) {
            const slug = art.title.toLowerCase().replace(/ /g, '-') + '-' + randomInt(100, 999)
            await prisma.article.upsert({
                where: { slug },
                update: {},
                create: {
                    title: art.title,
                    slug,
                    description: "Learn more about this topic.",
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    category: art.cat,
                    coverImage: art.img,
                    published: true,
                    authorId: adminUser.id,
                    updatedAt: new Date()
                }
            })
        }
    }

    console.log("✅ Simulation Data Populated Successfully!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
