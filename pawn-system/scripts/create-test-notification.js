const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Creating test notification for Ron...")

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

    // Create an unread notification
    const notification = await prisma.notification.create({
        data: {
            userId: ron.id,
            type: 'SYSTEM',
            title: 'Test Notification',
            message: 'This is a test notification to verify the badge is working!',
            isRead: false,
            link: '/portal/notifications'
        }
    })

    console.log(`✅ Created notification: ${notification.id}`)
    console.log(`   Title: ${notification.title}`)
    console.log(`   Read: ${notification.isRead}`)

    // Check unread count
    const unreadCount = await prisma.notification.count({
        where: {
            userId: ron.id,
            isRead: false
        }
    })

    console.log(`\n🔔 Ron now has ${unreadCount} unread notifications`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
