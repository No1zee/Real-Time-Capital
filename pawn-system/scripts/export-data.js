
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all data from current database...');

    // Fetch data in order of dependency
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const sessions = await prisma.session.findMany();
    // Fetch Customers before Loans
    const customers = await prisma.customer.findMany();
    // Fetch Loans before Items and Payments
    const loans = await prisma.loan.findMany();
    const items = await prisma.item.findMany();
    const payments = await prisma.payment.findMany();

    // Auctions and Bids
    const auctions = await prisma.auction.findMany();
    const bids = await prisma.bid.findMany();
    const autoBids = await prisma.autoBid.findMany();
    const watchlists = await prisma.watchlist.findMany();
    const ratings = await prisma.rating.findMany();
    const disputes = await prisma.dispute.findMany();

    // Transactions and Notifications
    const transactions = await prisma.transaction.findMany();
    const notifications = await prisma.notification.findMany();

    const data = {
        users,
        accounts,
        sessions,
        customers,
        loans,
        items,
        payments,
        auctions,
        bids,
        autoBids,
        watchlists,
        ratings,
        disputes,
        transactions,
        notifications
    };

    const outputPath = path.join(__dirname, '..', 'prisma', 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`Data exported to ${outputPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
