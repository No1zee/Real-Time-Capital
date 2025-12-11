import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("📚 Seeding Knowledge Hub Articles ONLY...")

    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } }) || await prisma.user.create({
        data: {
            name: "Admin Seeder",
            email: "seeder@admin.com",
            role: "ADMIN",
            password: "placeholder"
        }
    })

    const articles = [
        // Loans
        { category: "loans", title: "Understanding Pawn Interest Rates", slug: "pawn-interest-explained", description: "How strictly regulated interest rates work in your favor." },
        { category: "loans", title: "What Happens If I Default?", slug: "loan-default-process", description: "A transparent guide to the grace period and auction process." },
        { category: "loans", title: "Maximizing Your Loan Value", slug: "maximize-loan-value", description: "Tips on preparing your items for the best appraisal." },

        // Auctions
        { category: "auctions", title: "Winning Strategies for Live Auctions", slug: "auction-winning-strategies", description: "How to use auto-bid and read the room." },
        { category: "auctions", title: "Anti-Snipe Protection Explained", slug: "anti-snipe-protection", description: "Why bids in the last 60 seconds extend the clock." },

        // Valuations / Items
        { category: "valuations", title: "How We Value Gold & Jewelry", slug: "gold-valuation-process", description: "Insight into our x-ray testing and market rate calculations." },
        { category: "valuations", title: "Authentication of Luxury Watches", slug: "watch-authentication", description: "Our 20-point inspection process for Rolex and Patek." },

        // Finance / Wallet
        { category: "finance", title: "Managing Your Cash Flow", slug: "managing-cash-flow", description: "Using pawn loans as a strategic business bridge." },
        { category: "finance", title: "Understanding Payout Methods", slug: "payout-methods", description: "Pros and cons of Cash vs. Zipit vs. EcoCash." },

        // Security / Profile
        { category: "security", title: "Keeping Your Account Safe", slug: "account-security", description: "Best practices for passwords and 2FA." },
        { category: "security", title: "Dealing with Disputes", slug: "dispute-resolution", description: "How our mediation process protects both parties." },

        // Staff / Admin
        { category: "staff", title: "Customer Verification SOP", slug: "customer-kyc-sop", description: "Standard operating procedure for verifying ID documents." },
        { category: "staff", title: " Handling Aggressive Customers", slug: "conflict-resolution", description: "De-escalation techniques for front-desk staff." },
        { category: "general", title: "Welcome to Cashpoint", slug: "welcome-guide", description: "Getting started with your digital pawn dashboard." }
    ]

    for (const art of articles) {
        await prisma.article.upsert({
            where: { slug: art.slug },
            update: {},
            create: {
                title: art.title,
                slug: art.slug,
                description: art.description,
                content: `<h1>${art.title}</h1><p>Placeholder content for ${art.title}. This represents detailed educational material.</p>`,
                category: art.category,
                published: true,
                authorId: adminUser.id
            }
        })
    }

    console.log("✅ Articles Seeded successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
