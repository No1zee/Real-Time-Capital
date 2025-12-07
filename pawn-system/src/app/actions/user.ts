"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getUserBids() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return []

    return await prisma.bid.findMany({
        where: { userId: user.id },
        include: {
            auction: {
                include: {
                    item: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    })
}
