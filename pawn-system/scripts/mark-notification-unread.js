const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Marking Ron's test notification as UNREAD...")

    // Find Ron
    const ron = await prisma.user.findFirst({
        where: { name: { contains: 'Ron', mode: 'insensitive' } }
    })

    if (!ron) {
        console.log("❌ Ron not found")
        return
    }

    console.log(`✅ Found Ron: ${ron.name} (${ron.id})`)

    // Mark the test notification as unread
    const updated = await prisma.notification.updateMany({
        where: {
            userId: ron.id,
            title: 'Test Notification'
        },
        data: {
            isRead: false
        }
    })

    console.log(`✅ Updated ${updated.count} notifications to unread`)

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
