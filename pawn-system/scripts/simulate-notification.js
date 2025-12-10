
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Injecting Win Notification...")

    // 1. Find Ron
    const ron = await prisma.user.findFirst({
        where: { name: { contains: "Ron", mode: 'insensitive' } }
    })

    if (!ron) { console.error("Ron not found"); return; }

    // 2. Create Notification
    await prisma.notification.create({
        data: {
            userId: ron.id,
            title: "Congratulations! You Won!",
            message: "This is a TEST notification to verify the new popup dialog with confetti! 🎊",
            type: "AUCTION_WON",
            link: "/portal/profile",
            read: false,
            createdAt: new Date()
        }
    })

    console.log(`✅ Notification injected for ${ron.name}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
