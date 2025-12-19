import { PrismaClient, Prisma, UserRole, ItemStatus, LoanStatus, AuctionStatus, AuctionType, AssetType } from '@prisma/client';
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

    // 3. Create ~60 Items
    console.log('Seeding Items...');
    const allItems = [];

    // Specific Item Templates for Realistic Data
    const ITEM_TEMPLATES: { category: AssetType, name: string, keyword: string, description: string }[] = [
        // Jewelry
        { category: AssetType.JEWELRY, name: 'Rolex Submariner Date', keyword: 'watch,rolex', description: 'Classic luxury divers watch with black dial and ceramic bezel.' },
        { category: AssetType.JEWELRY, name: 'Diamond Engagement Ring', keyword: 'diamond,ring', description: '1.5 carat round cut diamond in 18k white gold setting.' },
        { category: AssetType.JEWELRY, name: '24k Gold Cuban Link Chain', keyword: 'gold,chain', description: 'Heavy solid gold chain with high-polish finish.' },
        { category: AssetType.JEWELRY, name: 'Vancleef & Arpels Bracelet', keyword: 'bracelet,gold', description: 'Alhambra 5 motifs bracelet in 18k yellow gold.' },

        // Electronics
        { category: AssetType.ELECTRONICS, name: 'iPhone 15 Pro Max', keyword: 'smartphone,iphone', description: 'Latest Apple flagship with Titanium build and A17 Pro chip.' },
        { category: AssetType.ELECTRONICS, name: 'MacBook Pro 16"', keyword: 'laptop,macbook', description: 'Powerful workstation with M3 Max chip and Liquid Retina XDR display.' },
        { category: AssetType.ELECTRONICS, name: 'Sony A7 IV Mirrorless Camera', keyword: 'camera,sony', description: 'High-resolution full-frame camera for professionals.' },
        { category: AssetType.ELECTRONICS, name: 'Bose QuietComfort Ultra', keyword: 'headphones,bose', description: 'Premium noise-cancelling wireless headphones.' },
        { category: AssetType.ELECTRONICS, name: 'PlayStation 5 Console', keyword: 'gaming,console', description: 'Next-gen gaming console with dual-sense controller.' },

        // Vehicles
        { category: AssetType.VEHICLE, name: 'Toyota Corolla 2022', keyword: 'car,toyota', description: 'Reliable sedan with modern safety features and fuel efficiency.' },
        { category: AssetType.VEHICLE, name: 'BMW 3 Series M Sport', keyword: 'car,bmw', description: 'Luxury sports sedan with premium interior and performance.' },
        { category: AssetType.VEHICLE, name: 'Honda Civic VTEC', keyword: 'car,honda', description: 'Sporty and reliable compact car with great handling.' },
        { category: AssetType.VEHICLE, name: 'Mercedes-Benz C-Class', keyword: 'car,mercedes', description: 'Elegant luxury sedan with cutting-edge technology.' },
        { category: AssetType.VEHICLE, name: 'Ford Ranger Wildtrak', keyword: 'truck,ford', description: 'Rugged and versatile pickup truck for all terrains.' },

        // Collectibles
        { category: AssetType.COLLECTIBLE, name: 'Charizard Base Set Holo', keyword: 'pokemon,card', description: 'Rare vintage Pokemon card in PSA 9 condition.' },
        { category: AssetType.COLLECTIBLE, name: 'Signed Babe Ruth Baseball', keyword: 'baseball,antique', description: 'Authentic vintage baseball signed by the legend.' },
        { category: AssetType.COLLECTIBLE, name: 'First Edition Spider-Man #1', keyword: 'comic,book', description: 'Iconic Marvel comic book in high grade condition.' },

        // Furniture
        { category: AssetType.FURNITURE, name: 'Eames Lounge Chair & Ottoman', keyword: 'furniture,chair', description: 'Iconic mid-century modern design classic.' },
        { category: AssetType.FURNITURE, name: 'Chesterfield Leather Sofa', keyword: 'sofa,furniture', description: 'Classic tufted leather sofa in deep burgundy.' },
        { category: AssetType.FURNITURE, name: 'Marble Top Dining Table', keyword: 'table,marble', description: 'Elegant 8-seater dining table with Italian marble top.' },

        // Property
        { category: AssetType.PROPERTY, name: 'Residential Stand - Borrowdale', keyword: 'land,nature', description: 'Prime 2000sqm residential stand in a gated community.' },
        { category: AssetType.PROPERTY, name: 'Commercial Building - CBD', keyword: 'building,city', description: 'Two-story retail space with high foot traffic in the city center.' },
        { category: AssetType.PROPERTY, name: 'Apartment - Avondale', keyword: 'apartment,modern', description: 'Modern 3-bedroom penthouse with panoramic views.' },

        // Goods
        { category: AssetType.GOODS, name: 'Solar Energy System (5kVA)', keyword: 'solar,panel', description: 'Complete solar kit with hybrid inverter and lithium batteries.' },
        { category: AssetType.GOODS, name: 'Industrial Welding Machine', keyword: 'machine,tool', description: 'High-power TIG/MIG welder for heavy duty fabrication.' },
        { category: AssetType.GOODS, name: 'Commercial Coffee Maker', keyword: 'coffee,espresso', description: 'Professional 2-group espresso machine for cafes.' },

        // Other
        { category: AssetType.OTHER, name: 'Gibson Les Paul Custom', keyword: 'guitar,gibson', description: 'Ebony finish electric guitar with gold hardware.' },
        { category: AssetType.OTHER, name: 'Louis Vuitton Keepall 55', keyword: 'bag,luxury', description: 'Classic monogram canvas travel bag.' },
        { category: AssetType.OTHER, name: 'Yamaha Upright Piano', keyword: 'piano,musical', description: 'Professional grade acoustic piano with rich tone.' }
    ];

    // Dynamic Image Generation using LoremFlickr with template-specific keywords
    const getImageUrl = (keyword: string, index: number) => {
        // Use index as lock to ensure same image for same item re-runs, but different per item
        return `https://loremflickr.com/800/600/${keyword}?lock=${index + 500}`;
    };

    for (let i = 0; i < 60; i++) {
        const template = faker.helpers.arrayElement(ITEM_TEMPLATES);
        const owner = faker.helpers.arrayElement(users);
        const isVehicle = template.category === 'VEHICLE';

        const selectedImage = getImageUrl(template.keyword, i);

        const item = await prisma.item.create({
            data: {
                name: template.name,
                description: `${template.description} ${faker.commerce.productDescription()}`,
                category: template.category,
                condition: faker.helpers.arrayElement(['NEW', 'LIKE_NEW', 'USED', 'DAMAGED']),
                marketValue: parseFloat(faker.commerce.price({ min: 500, max: 25000 })),
                userEstimatedValue: parseFloat(faker.commerce.price({ min: 500, max: 25000 })),
                finalValuation: parseFloat(faker.commerce.price({ min: 300, max: 15000 })),
                valuation: parseFloat(faker.commerce.price({ min: 300, max: 15000 })),
                status: ItemStatus.VALUED,
                userId: owner.id,
                images: JSON.stringify([selectedImage]),
                updatedAt: new Date(),
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
