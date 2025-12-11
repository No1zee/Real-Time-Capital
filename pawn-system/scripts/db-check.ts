
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
    try {
        console.log('Attempting to connect to database...')
        await prisma.$connect()
        const count = await prisma.user.count()
        console.log(`Successfully connected! User count: ${count}`)
    } catch (e: any) {
        console.error('Connection failed:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

check()
