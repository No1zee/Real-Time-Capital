
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const seedFile = path.join(__dirname, 'seed-data.json');
    if (!fs.existsSync(seedFile)) {
        console.log('No seed-data.json found. Skipping seed.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    console.log('Seeding data...');

    // 1. Users
    console.log('Seeding Users...');
    for (const user of data.users) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: user,
        });
    }

    // 2. Customers
    console.log('Seeding Customers...');
    for (const customer of data.customers) {
        await prisma.customer.upsert({
            where: { id: customer.id },
            update: {},
            create: customer,
        });
    }

    // 3. Loans (depend on User and Customer)
    console.log('Seeding Loans...');
    for (const loan of data.loans) {
        await prisma.loan.upsert({
            where: { id: loan.id },
            update: {},
            create: loan,
        });
    }

    // 4. Items (depend on Loan, User?, Auction?)
    // Items might reference Auction, but Auction references Item. Circular?
    // Item has loanId (optional), userId (optional).
    // Auction has itemId (unique).
    // Strategy: Create Items first without Auction relation implicitly?
    // The Item model has an 'Auction' field? No, Auction has 'itemId' and Item has 'Auction?'.
    // But Item is 'references' side?
    // Schema:
    // model Auction { itemId String @unique ... Item Item @relation(fields: [itemId]...) }
    // model Item { User? ... Auction? }
    // So Auction depends on Item. Item must be created FIRST.
    console.log('Seeding Items...');
    for (const item of data.items) {
        // Ensure we don't try to connect invalid relations if they don't exist yet?
        // Item only depends on Loan and User.
        await prisma.item.upsert({
            where: { id: item.id },
            update: {},
            create: item,
        });
    }

    // 5. Auctions (depend on Item)
    console.log('Seeding Auctions...');
    for (const auction of data.auctions) {
        await prisma.auction.upsert({
            where: { id: auction.id },
            update: {},
            create: auction,
        });
    }

    // 6. Bids, AutoBids, etc. (depend on Auction and User)
    console.log('Seeding Bids...');
    for (const bid of data.bids) {
        await prisma.bid.upsert({
            where: { id: bid.id },
            update: {},
            create: bid,
        });
    }

    console.log('Seeding AutoBids...');
    for (const ab of data.autoBids) {
        // AutoBid uses composite key in schema: @@unique([userId, auctionId])?
        // Check schema. Yes: model AutoBid { id String @id ... @@unique([userId, auctionId]) }
        // Upsert needs usage of unique constraint.
        await prisma.autoBid.upsert({
            where: { id: ab.id },
            update: {},
            create: ab,
        });
    }

    // 7. Payments (depend on Loan)
    console.log('Seeding Payments...');
    for (const p of data.payments) {
        await prisma.payment.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        });
    }

    // 8. Other models
    console.log('Seeding Transactions...');
    for (const t of data.transactions) {
        await prisma.transaction.upsert({
            where: { id: t.id },
            update: {},
            create: t,
        });
    }

    console.log('Seeding Notifications...');
    for (const n of data.notifications) {
        await prisma.notification.upsert({
            where: { id: n.id },
            update: {},
            create: n,
        });
    }

    // Watchlist, Ratings, Disputes
    console.log('Seeding Watchlist, Ratings, Disputes...');
    // Watchlist logic
    for (const w of data.watchlists || []) {
        await prisma.watchlist.upsert({
            where: { id: w.id },
            update: {},
            create: w
        })
    }
    // Rating has unique auctionId
    for (const r of data.ratings || []) {
        await prisma.rating.upsert({
            where: { id: r.id },
            update: {},
            create: r
        })
    }
    for (const d of data.disputes || []) {
        await prisma.dispute.upsert({
            where: { id: d.id },
            update: {},
            create: d
        })
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
