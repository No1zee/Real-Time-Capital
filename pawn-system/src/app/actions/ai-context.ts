"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getAIContextData() {
    const session = await auth()
    if (!session?.user?.id) return { walletBalance: 0, auctionDeposit: 0 }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                walletBalance: true,
                auctionDeposit: true
            }
        })

        return {
            walletBalance: Number(user?.walletBalance || 0),
            auctionDeposit: Number(user?.auctionDeposit || 0)
        }
    } catch (error) {
        console.error("Failed to fetch AI context:", error)
        return { walletBalance: 0, auctionDeposit: 0 }
    }
}
