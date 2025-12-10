const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking Ron's notifications...")

    // Find Ron
    const ron = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'ron', mode: 'insensitive' } },
                { name: { contains: 'Ron', mode: 'insensitive' } }
            ]
        }
    })

    if (!ron) {
        console.log("❌ Ron not found")
        return
    }

    console.log(`✅ Found Ron: ${ron.name} (${ron.id})`)

    // Get Ron's notifications
    const notifications = await prisma.notification.findMany({
        where: { userId: ron.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    console.log(`\n📬 Ron has ${notifications.length} notifications:`)

    notifications.forEach((notif, index) => {
        console.log(`\n${index + 1}. ${notif.type} - ${notif.isRead ? '✓ Read' : '🔔 Unread'}`)
        console.log(`   Title: ${notif.title}`)
        console.log(`   Message: ${notif.message}`)
        console.log(`   Created: ${notif.createdAt}`)
        if (notif.link) console.log(`   Link: ${notif.link}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
