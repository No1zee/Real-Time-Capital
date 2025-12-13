import { PrismaClient, Prisma, UserRole, ItemStatus, LoanStatus, AuctionStatus, AuctionType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting simulation seed...');

    // 1. Create ~20 Users (Customers)
    console.log('Seeding Users...');
    const users = [];
    for (let i = 0; i < 20; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const user = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email: faker.internet.email({ firstName, lastName }),
                phoneNumber: faker.phone.number(),
                nationalId: faker.string.numeric(10), // Simple ID
                address: faker.location.streetAddress({ useFullAddress: true }),
                role: UserRole.CUSTOMER,
                password: '$2a$10$EpIs/sO.8.r8X/O.8.r8X/O.8.r8X/O.8.r8X/O.8.r8X/O.8.r8X', // Dummy hash
                emailVerified: new Date(),
                walletBalance: parseFloat(faker.finance.amount({ min: 100, max: 5000 })),
                image: faker.image.avatar(),
                updatedAt: new Date()
            }
        }).catch(e => {
            console.log(`Skipping duplicate user`);
            return null;
        });
        if (user) users.push(user);
    }
    console.log(`Created ${users.length} users.`);

    // 2. Create ~10 Customers (External/Offline)
    console.log('Seeding Offline Customers...');
    const customers = [];
    for (let i = 0; i < 10; i++) {
        const customer = await prisma.customer.create({
            data: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                nationalId: faker.string.alphanumeric(10).toUpperCase(),
                phoneNumber: faker.phone.number(),
                email: faker.internet.email(),
                address: faker.location.streetAddress(),
                creditScore: faker.number.int({ min: 300, max: 850 }),
                updatedAt: new Date()
            }
        });
        customers.push(customer);
    }
    console.log(`Created ${customers.length} offline customers.`);

    // 3. Create ~40 Items
    console.log('Seeding Items...');
    const allItems = [];
    const itemCategories = ['JEWELRY', 'ELECTRONICS', 'VEHICLE', 'COLLECTIBLE', 'FURNITURE', 'OTHER'] as const;

    // Dynamic Image Generation using LoremFlickr with locks for stability & variety
    const getImageUrl = (category: string, index: number) => {
        const keywords: Record<string, string> = {
            VEHICLE: 'transport,car',
            JEWELRY: 'jewelry,necklace',
            ELECTRONICS: 'technology,computer',
            COLLECTIBLE: 'antique,art',
            FURNITURE: 'furniture,interior',
            OTHER: 'object'
        };
        const keyword = keywords[category] || 'object';
        // Use index as lock to ensure same image for same item re-runs, but different per item
        return `https://loremflickr.com/800/600/${keyword}?lock=${index + 100}`;
    };

    for (let i = 0; i < 40; i++) {
        const isVehicle = Math.random() > 0.8;
        const category = isVehicle ? 'VEHICLE' : faker.helpers.arrayElement(itemCategories);
        const owner = faker.helpers.arrayElement(users);

        const selectedImage = getImageUrl(category, i);

        const item = await prisma.item.create({
            data: {
                name: isVehicle ? `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}` : faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                category: category,
                condition: faker.helpers.arrayElement(['NEW', 'LIKE_NEW', 'USED', 'DAMAGED']),
                marketValue: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
                userEstimatedValue: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
                finalValuation: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
                valuation: parseFloat(faker.commerce.price({ min: 100, max: 5000 })), // Legacy field
                status: ItemStatus.VALUED, // Default state, will update for loans/auctions
                userId: owner.id,
                images: JSON.stringify([selectedImage]),
                updatedAt: new Date(),
                // Vehicle specifics if applicable
                ...(isVehicle ? {
                    vin: faker.vehicle.vin(),
                    mileage: faker.number.int({ min: 1000, max: 150000 }),
                    color: faker.vehicle.color(),
                    yearOfPurchase: faker.number.int({ min: 2010, max: 2024 })
                } : {})
            }
        });
        allItems.push(item);
    }
    console.log(`Created ${allItems.length} items.`);

    // 4. Create Loans (~20)
    console.log('Seeding Loans...');
    const loanItems = allItems.slice(0, 20); // First 20 items get loans
    const loans = [];

    for (const item of loanItems) {
        const principal = Number(item.finalValuation || 500) * 0.5; // 50% LTV
        const startDate = faker.date.recent({ days: 60 });
        const duration = 30;
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + duration);

        // Determine status based on time
        let status: LoanStatus = LoanStatus.ACTIVE;
        const isPastDue = dueDate < new Date();

        if (isPastDue) {
            status = Math.random() > 0.5 ? LoanStatus.DEFAULTED : LoanStatus.COMPLETED;
        }

        const loan = await prisma.loan.create({
            data: {
                userId: item.userId,
                principalAmount: principal,
                interestRate: new Prisma.Decimal(0.15), // 15%
                durationDays: duration,
                startDate: startDate,
                dueDate: dueDate,
                status: status,
                termsAccepted: true,
                updatedAt: new Date(),
                Item: { connect: { id: item.id } } // Connect item
            }
        });

        // Update item status if Pawned
        if (status === LoanStatus.ACTIVE) {
            await prisma.item.update({ where: { id: item.id }, data: { status: ItemStatus.PAWNED, loanId: loan.id } });
        } else if (status === LoanStatus.DEFAULTED) {
            // Will be moved to auction
            await prisma.item.update({ where: { id: item.id }, data: { status: ItemStatus.IN_AUCTION, loanId: loan.id } });
        } else {
            await prisma.item.update({ where: { id: item.id }, data: { status: ItemStatus.REDEEMED, loanId: loan.id } });
        }

        loans.push(loan);

        // Add dummy payment if completed or active (partial)
        if (status === LoanStatus.COMPLETED || (status === LoanStatus.ACTIVE && Math.random() > 0.5)) {
            await prisma.payment.create({
                data: {
                    loanId: loan.id,
                    amount: status === LoanStatus.COMPLETED ? new Prisma.Decimal(principal * 1.15) : new Prisma.Decimal(principal * 0.15),
                    method: 'ECOCASH',
                    reference: faker.string.alphanumeric(8).toUpperCase(),
                    date: faker.date.between({ from: startDate, to: new Date() })
                }
            });
        }
    }
    console.log(`Created ${loans.length} loans.`);

    // 5. Create Auctions
    console.log('Seeding Auctions...');
    const defaultedItems = await prisma.item.findMany({
        where: { status: ItemStatus.IN_AUCTION },
        include: { Auction: true }
    });
    // Filter out items that already have an Auction
    const itemsNeedAuction = defaultedItems.filter(i => !i.Auction);

    const freeItems = allItems.slice(20, 30);
    const auctionItems = [...itemsNeedAuction, ...freeItems];

    const auctions = [];

    for (const item of auctionItems) {
        const isLive = Math.random() > 0.4;
        const isEnded = !isLive && Math.random() > 0.5;

        let startTime = new Date();
        let endTime = new Date();
        let status: AuctionStatus = AuctionStatus.SCHEDULED;

        if (isLive) {
            startTime = faker.date.recent({ days: 1 });
            endTime = faker.date.soon({ days: 2 });
            status = AuctionStatus.ACTIVE;
        } else if (isEnded) {
            startTime = faker.date.recent({ days: 10 });
            endTime = faker.date.recent({ days: 1 });
            status = AuctionStatus.ENDED;
        } else {
            // Scheduled
            startTime = faker.date.soon({ days: 1 });
            endTime = faker.date.soon({ days: 3 });
            status = AuctionStatus.SCHEDULED;
        }

        // Ensure item status matches
        if (isEnded) {
            await prisma.item.update({ where: { id: item.id }, data: { status: ItemStatus.SOLD } });
        } else {
            await prisma.item.update({ where: { id: item.id }, data: { status: ItemStatus.IN_AUCTION } });
        }

        const auction = await prisma.auction.create({
            data: {
                itemId: item.id,
                startPrice: item.finalValuation || item.marketValue || 100,
                currentBid: isLive || isEnded ? (Number(item.finalValuation) * 1.2) : null,
                startTime: startTime,
                endTime: endTime,
                status: status,
                type: AuctionType.ONLINE,
                updatedAt: new Date()
            }
        });
        auctions.push(auction);

        // 6. Bids for Live/Ended Auctions
        if (status === AuctionStatus.ACTIVE || status === AuctionStatus.ENDED) {
            const numBids = faker.number.int({ min: 3, max: 15 });
            let currentPrice = Number(auction.startPrice);

            for (let b = 0; b < numBids; b++) {
                const bidder = faker.helpers.arrayElement(users);
                const increment = faker.number.int({ min: 10, max: 50 });
                currentPrice += increment;

                await prisma.bid.create({
                    data: {
                        auctionId: auction.id,
                        userId: bidder.id,
                        amount: new Prisma.Decimal(currentPrice),
                        createdAt: faker.date.between({ from: startTime, to: isEnded ? endTime : new Date() })
                    }
                });
            }
            // Update auction current bid
            await prisma.auction.update({
                where: { id: auction.id },
                data: { currentBid: new Prisma.Decimal(currentPrice) }
            });
        }
    }
    console.log(`Created ${auctions.length} auctions.`);

    console.log('Simulation Seed Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
