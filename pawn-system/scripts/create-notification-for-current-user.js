const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Creating unread notification for smurder@kukuland.com...")

    // Find the user
    const user = await prisma.user.findUnique({
        where: { email: 'smurder@kukuland.com' }
    })

    if (!user) {
        console.log("❌ User not found")
        return
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`)

    // Create an unread notification
    const notification = await prisma.notification.create({
        data: {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Test Notification',
            message: 'This is a test notification to verify the badge is working!',
            isRead: false,
            link: '/portal/notifications'
        }
    })

    console.log(`✅ Created notification: ${notification.id}`)

    // Check unread count
    const unreadCount = await prisma.notification.count({
        where: {
            userId: user.id,
            isRead: false
        }
    })

    console.log(`\n🔔 User now has ${unreadCount} unread notifications`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
