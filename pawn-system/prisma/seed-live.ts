
import { PrismaClient, UserRole, LoanStatus, ItemStatus, TransactionStatus, TransactionType, TransactionMethod, AuctionStatus, VerificationStatus } from "@prisma/client"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting realistic data seed...")

    // cleanup
    // await prisma.auditLog.deleteMany()
    // await prisma.transaction.deleteMany()
    // await prisma.bids.deleteMany() // Note: model is Bid but table often Bids? Prisma uses singular: Bid
    // await prisma.bid.deleteMany()
    // await prisma.auction.deleteMany()
    // await prisma.item.deleteMany()
    // await prisma.loan.deleteMany()
    // await prisma.user.deleteMany({ where: { role: "CUSTOMER" } }) 

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
                role: UserRole.CUSTOMER,
                verificationStatus: VerificationStatus.VERIFIED,
                image: faker.image.avatar(),
                isActive: true,
            }
        })
        customers.push(customer)
    }
    console.log(`✅ Created ${customers.length} customers`)

    // 2. Create Loans & Items & Transactions
    const loanStatuses = [LoanStatus.ACTIVE, LoanStatus.COMPLETED, LoanStatus.DEFAULTED, LoanStatus.PENDING, LoanStatus.APPROVED]
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

            // Decimal/float handling: Pass as string to avoid precision issues
            const principal = faker.finance.amount({ min: 50, max: 2000, dec: 2 })
            const interestRate = "10"

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
            let itemInitStatus: ItemStatus = ItemStatus.PENDING_VALUATION
            if (status === LoanStatus.ACTIVE) itemInitStatus = ItemStatus.PAWNED
            else if (status === LoanStatus.COMPLETED) itemInitStatus = ItemStatus.REDEEMED
            else if (status === LoanStatus.DEFAULTED) itemInitStatus = ItemStatus.IN_AUCTION

            // Create Item
            const item = await prisma.item.create({
                data: {
                    loanId: loan.id,
                    userId: customer.id,
                    name: `${faker.commerce.productAdjective()} ${category}`,
                    description: faker.commerce.productDescription(),
                    category: category,
                    valuation: Number(principal) * 1.5, // Prisma accepts number
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
                    type: TransactionType.WITHDRAWAL, // Loan payout
                    status: TransactionStatus.COMPLETED,
                    method: TransactionMethod.CASH,
                    createdAt: createdAt,
                    reference: `LOAN-${loan.id.slice(-6)}`
                }
            })

            // If Completed, create Repayment
            if (status === LoanStatus.COMPLETED) {
                const repayDate = faker.date.between({ from: createdAt, to: dueDate })
                const totalDue = Number(principal) * (1 + Number(interestRate) / 100)

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
                        type: TransactionType.DEPOSIT, // Repayment
                        status: TransactionStatus.COMPLETED,
                        method: TransactionMethod.CASH,
                        createdAt: repayDate,
                        reference: `REPAY-${loan.id.slice(-6)}`
                    }
                })
            }

            // Auction logic
            if (status === LoanStatus.DEFAULTED && faker.datatype.boolean()) {
                const aucStatusKey = faker.helpers.arrayElement(["ENDED", "ACTIVE", "SCHEDULED"])
                let aucStatus: AuctionStatus = AuctionStatus.SCHEDULED
                if (aucStatusKey === "ENDED") aucStatus = AuctionStatus.ENDED
                if (aucStatusKey === "ACTIVE") aucStatus = AuctionStatus.ACTIVE

                const startPrice = Number(principal) * 1.1

                const auction = await prisma.auction.create({
                    data: {
                        itemId: item.id,
                        startPrice: startPrice,
                        currentBid: aucStatus === AuctionStatus.ENDED ? startPrice * 1.5 : (aucStatus === AuctionStatus.ACTIVE ? startPrice * 1.2 : undefined),
                        status: aucStatus,
                        startTime: faker.date.recent({ days: 10 }),
                        endTime: faker.date.soon({ days: 5 }),
                        createdAt: faker.date.recent({ days: 15 }),
                        updatedAt: new Date(),
                        // Auto-generated ID in schema now
                        // id is optional
                        // winnerId? Model in schema has 'AutoBid', 'Bid', 'Dispute'...
                        // Schema DOES NOT HAVE 'winnerId' field on Auction?
                        // Let's re-read Schema line 111+
                        // It has AutoBid, Bid, Dispute, Rating, Watchlist relations. 
                        // It does NOT have winnerId. The winner is determined by highest bid or maybe 'soldPrice' implies it?
                        // Or maybe logic is: check 'Bids' for highest?
                        // IF SOLD, there must be a winner. 
                        // Wait, previous code tried to set 'winnerId'. That caused error.
                        // I will REMOVE winnerId logic.
                        // soldPrice is Decimal? No, Schema line 114: startPrice, currentBid. 
                        // Schema DOES NOT have soldPrice on Auction model!
                        // It has item.salePrice? 
                        // Item model line 194: salePrice Decimal? soldAt DateTime?
                        // So sold info is on ITEM.
                    }
                })

                // Update Item if sold
                if (aucStatus === AuctionStatus.ENDED) {
                    await prisma.item.update({
                        where: { id: item.id },
                        data: {
                            status: ItemStatus.SOLD,
                            salePrice: startPrice * 1.5,
                            soldAt: new Date(),
                            // Winner? Schema Item line 198: userId String? (owner?). 
                            // If sold, maybe ownership transfers? Or just mark sold.
                            // I'll leave userId as original owner for history, but maybe add 'buyerId' later.
                            // For now, just mark SOLD.
                        }
                    })
                }

                if (aucStatus !== AuctionStatus.SCHEDULED) {
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
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
