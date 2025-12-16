"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function logPattern(type: string, target: string) {
    const session = await auth()
    if (!session?.user?.id) return // Don't track guests in DB for now (or use cookie ID later)

    try {
        await prisma.userPattern.upsert({
            where: {
                userId_type_target: {
                    userId: session.user.id,
                    type,
                    target
                }
            },
            create: {
                userId: session.user.id,
                type,
                target,
                count: 1
            },
            update: {
                count: { increment: 1 }
            }
        })
    } catch (error) {
        console.error("Failed to log pattern:", error)
        // Fail silently so we don't block UI
    }
}

export async function getTopPatterns() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.userPattern.findMany({
        where: { userId: session.user.id },
        orderBy: { count: 'desc' },
        take: 5
    })
}
