const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Marking ALL of Ron's notifications as UNREAD...")

    const result = await prisma.notification.updateMany({
        where: {
            userId: 'cmivkcq1a0000xmp38zlk3hb9'
        },
        data: {
            isRead: false
        }
    })

    console.log(`✅ Marked ${result.count} notifications as unread`)

    // Check count
    const unreadCount = await prisma.notification.count({
        where: {
            userId: 'cmivkcq1a0000xmp38zlk3hb9',
            isRead: false
        }
    })

    console.log(`🔔 Ron now has ${unreadCount} unread notifications`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
