
import { PrismaClient } from "@prisma/client"
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log("Reading backup data...")
    const rawData = fs.readFileSync('backup_data.json', 'utf-8')
    const data = JSON.parse(rawData)

    console.log("Seeding data to Postgres...")

    // 1. Users
    for (const user of data.users) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
                walletBalance: user.walletBalance,
                practiceBalance: user.practiceBalance
            },
            create: {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
                walletBalance: user.walletBalance,
                practiceBalance: user.practiceBalance
            }
        })
    }

    // Customers
    if (data.customers) {
        for (const customer of data.customers) {
            await prisma.customer.upsert({
                where: { id: customer.id },
                update: {
                    ...customer,
                    createdAt: new Date(customer.createdAt),
                    updatedAt: new Date(customer.updatedAt)
                },
                create: {
                    ...customer,
                    createdAt: new Date(customer.createdAt),
                    updatedAt: new Date(customer.updatedAt)
                }
            })
        }
    }

    // 2. Loans
    if (data.loans) {
        for (const loan of data.loans) {
            await prisma.loan.upsert({
                where: { id: loan.id },
                update: {
                    ...loan,
                    principalAmount: loan.principalAmount,
                    interestRate: loan.interestRate,
                    startDate: new Date(loan.startDate),
                    dueDate: new Date(loan.dueDate),
                    createdAt: new Date(loan.createdAt),
                    updatedAt: new Date(loan.updatedAt)
                },
                create: {
                    ...loan,
                    principalAmount: loan.principalAmount,
                    interestRate: loan.interestRate,
                    startDate: new Date(loan.startDate),
                    dueDate: new Date(loan.dueDate),
                    createdAt: new Date(loan.createdAt),
                    updatedAt: new Date(loan.updatedAt)
                }
            })
        }
    }

    // 3. Items
    if (data.items) {
        for (const item of data.items) {
            await prisma.item.upsert({
                where: { id: item.id },
                update: {
                    ...item,
                    valuation: item.valuation,
                    salePrice: item.salePrice,
                    soldAt: item.soldAt ? new Date(item.soldAt) : null,
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt)
                },
                create: {
                    ...item,
                    valuation: item.valuation,
                    salePrice: item.salePrice,
                    soldAt: item.soldAt ? new Date(item.soldAt) : null,
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt)
                }
            })
        }
    }

    // 4. Auctions
    if (data.auctions) {
        for (const auction of data.auctions) {
            await prisma.auction.upsert({
                where: { id: auction.id },
                update: {
                    ...auction,
                    startPrice: auction.startPrice,
                    currentBid: auction.currentBid,
                    startTime: new Date(auction.startTime),
                    endTime: new Date(auction.endTime),
                    createdAt: new Date(auction.createdAt),
                    updatedAt: new Date(auction.updatedAt)
                },
                create: {
                    ...auction,
                    startPrice: auction.startPrice,
                    currentBid: auction.currentBid,
                    startTime: new Date(auction.startTime),
                    endTime: new Date(auction.endTime),
                    createdAt: new Date(auction.createdAt),
                    updatedAt: new Date(auction.updatedAt)
                }
            })
        }
    }

    // 5. Notifications
    if (data.notifications) {
        for (const notification of data.notifications) {
            await prisma.notification.upsert({
                where: { id: notification.id },
                update: {
                    ...notification,
                    createdAt: new Date(notification.createdAt)
                },
                create: {
                    ...notification,
                    createdAt: new Date(notification.createdAt)
                }
            })
        }
    }

    console.log("Seeding complete!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
