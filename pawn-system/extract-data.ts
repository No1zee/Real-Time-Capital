
import { PrismaClient } from "@prisma/client"
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log("Extracting data...")
    const data: any = {}

    // 1. Independent Entities
    data.users = await prisma.user.findMany()
    data.customers = await prisma.customer.findMany()

    // 2. Dependent on Users
    data.accounts = await prisma.account.findMany()
    data.sessions = await prisma.session.findMany()
    data.verificationTokens = await prisma.verificationToken.findMany()

    // 3. Loans (User/Customer)
    data.loans = await prisma.loan.findMany()

    // 4. Items (User/Loan)
    data.items = await prisma.item.findMany()

    // 5. Auctions (Item)
    data.auctions = await prisma.auction.findMany()

    // 6. Auction/User dependants
    data.bids = await prisma.bid.findMany()
    data.watchlists = await prisma.watchlist.findMany()
    data.autoBids = await prisma.autoBid.findMany()
    data.ratings = await prisma.rating.findMany()
    data.disputes = await prisma.dispute.findMany()

    // 7. Others
    data.notifications = await prisma.notification.findMany()
    data.payments = await prisma.payment.findMany()
    data.transactions = await prisma.transaction.findMany()

    fs.writeFileSync('backup_data.json', JSON.stringify(data, null, 2))
    console.log(`Backup complete. Users: ${data.users.length}, Items: ${data.items.length}, Loans: ${data.loans.length}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
