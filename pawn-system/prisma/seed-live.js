
const { PrismaClient, UserRole, LoanStatus, ItemStatus, TransactionStatus, TransactionType, TransactionMethod, AuctionStatus, VerificationStatus } = require("@prisma/client")
const { faker } = require("@faker-js/faker")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting realistic data seed (JS Mode)...")

    const passwordHash = await bcrypt.hash("password123", 10)

    // 1. Create 20 Customers
    const customers = []
    for (let i = 0; i < 20; i++) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const customer = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: faker.internet.email({ firstName, lastName }),
                password: passwordHash,
                role: "CUSTOMER", // JS allows string if matches enum
                verificationStatus: "VERIFIED",
                image: faker.image.avatar(),
                isActive: true,
            }
        })
        customers.push(customer)
    }
    console.log(`✅ Created ${customers.length} customers`)

    // 2. Create Loans & Items & Transactions
    const loanStatuses = ["ACTIVE", "COMPLETED", "DEFAULTED", "PENDING", "APPROVED"]
    const itemCategories = ["Electronics", "Jewelry", "Tools", "Musical Instruments", "Collectibles"]

    for (const customer of customers) {
        // Each customer has 1-3 loans
        const numLoans = faker.number.int({ min: 1, max: 3 })

        for (let j = 0; j < numLoans; j++) {
            const status = faker.helpers.arrayElement(loanStatuses)
            const category = faker.helpers.arrayElement(itemCategories)

            // Random date in last 90 days
            const createdAt = faker.date.recent({ days: 90 })
            const duration = 30
            const dueDate = new Date(createdAt)
            dueDate.setDate(dueDate.getDate() + duration)

            // Decimal/float handling
            const principal = Number(faker.finance.amount({ min: 50, max: 2000, dec: 2 }))
            const interestRate = 10

            // Create Loan
            const loan = await prisma.loan.create({
                data: {
                    userId: customer.id,
                    principalAmount: principal,
                    interestRate: interestRate,
                    durationDays: duration,
                    startDate: createdAt,
                    dueDate: dueDate,
                    status: status,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    ticketRef: `TCK-${faker.string.alphanumeric(8).toUpperCase()}`,
                }
            })

            // Determine Item Status
            let itemInitStatus = "PENDING_VALUATION"
            if (status === "ACTIVE") itemInitStatus = "PAWNED"
            else if (status === "COMPLETED") itemInitStatus = "REDEEMED"
            else if (status === "DEFAULTED") itemInitStatus = "IN_AUCTION"

            // Create Item
            const item = await prisma.item.create({
                data: {
                    loanId: loan.id,
                    userId: customer.id,
                    name: `${faker.commerce.productAdjective()} ${category}`,
                    description: faker.commerce.productDescription(),
                    category: category,
                    valuation: principal * 1.5,
                    status: itemInitStatus,
                    createdAt: createdAt,
                    updatedAt: createdAt
                }
            })

            // Create Initial Deposit Transaction (Money out to customer)
            await prisma.transaction.create({
                data: {
                    userId: customer.id,
                    amount: principal,
                    type: "WITHDRAWAL",
                    status: "COMPLETED",
                    method: "CASH",
                    createdAt: createdAt,
                    reference: `LOAN-${loan.id.slice(-6)}`
                }
            })

            // If Completed, create Repayment
            if (status === "COMPLETED") {
                const repayDate = faker.date.between({ from: createdAt, to: dueDate })
                const totalDue = principal * (1 + interestRate / 100)

                await prisma.payment.create({
                    data: {
                        loanId: loan.id,
                        amount: totalDue,
                        date: repayDate,
                        method: "CASH",
                        createdAt: repayDate
                    }
                })

                await prisma.transaction.create({
                    data: {
                        userId: customer.id,
                        amount: totalDue,
                        type: "DEPOSIT",
                        status: "COMPLETED",
                        method: "CASH",
                        createdAt: repayDate,
                        reference: `REPAY-${loan.id.slice(-6)}`
                    }
                })
            }

            // Auction logic
            if (status === "DEFAULTED" && faker.datatype.boolean()) {
                const aucStatusKey = faker.helpers.arrayElement(["ENDED", "ACTIVE", "SCHEDULED"])
                let aucStatus = "SCHEDULED"
                if (aucStatusKey === "ENDED") aucStatus = "ENDED"
                if (aucStatusKey === "ACTIVE") aucStatus = "ACTIVE"

                const startPrice = principal * 1.1

                const auction = await prisma.auction.create({
                    data: {
                        itemId: item.id,
                        startPrice: startPrice,
                        currentBid: aucStatus === "ENDED" ? startPrice * 1.5 : (aucStatus === "ACTIVE" ? startPrice * 1.2 : undefined),
                        status: aucStatus,
                        startTime: faker.date.recent({ days: 10 }),
                        endTime: faker.date.soon({ days: 5 }),
                        createdAt: faker.date.recent({ days: 15 }),
                        updatedAt: new Date(),
                        winnerId: aucStatus === "ENDED" ? faker.helpers.arrayElement(customers).id : undefined,
                        soldPrice: aucStatus === "ENDED" ? startPrice * 1.5 : undefined
                    }
                })

                if (aucStatus !== "SCHEDULED") {
                    const numBids = faker.number.int({ min: 3, max: 10 })
                    let currentBidPrice = startPrice

                    for (let k = 0; k < numBids; k++) {
                        const bidder = faker.helpers.arrayElement(customers)
                        currentBidPrice += Number(faker.finance.amount({ min: 5, max: 50 }))

                        await prisma.bid.create({
                            data: {
                                auctionId: auction.id,
                                userId: bidder.id,
                                amount: currentBidPrice,
                                createdAt: faker.date.between({ from: auction.startTime, to: new Date() })
                            }
                        })
                    }
                }
            }
        }
    }
    console.log("✅ Created Loans, Items, Transactions")

    // 3. Audit Logs
    for (const customer of customers) {
        await prisma.auditLog.create({
            data: {
                userId: customer.id,
                action: "LOGIN",
                entityType: "USER",
                entityId: customer.id,
                ipAddress: faker.internet.ipv4(),
                userAgent: faker.internet.userAgent(),
                createdAt: faker.date.recent({ days: 7 })
            }
        })
    }
    console.log("✅ Created Audit Logs")
    console.log("🌱 Seeding completed!")
}

main()
    .catch((e) => {
        console.error("SEED ERROR:")
        console.error(JSON.stringify(e, null, 2))
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
