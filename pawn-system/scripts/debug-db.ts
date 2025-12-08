import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Database Connection...')
    console.log('URL defined:', !!process.env.DATABASE_URL)

    try {
        const userCount = await prisma.user.count()
        console.log(`✅ Successfully connected! Found ${userCount} users.`)
        const items = await prisma.item.findMany({ take: 1 })
        console.log(`✅ Items table accessible. Found ${items.length} sample item.`)
    } catch (error) {
        console.error('❌ Connection failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
