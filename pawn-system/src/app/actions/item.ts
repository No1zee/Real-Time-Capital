"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function getUserItems() {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    try {
        const items = await db.item.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                updatedAt: "desc"
            },
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                status: true,
                valuationStatus: true,
                userEstimatedValue: true,
                valuation: true, // Market Value / Preliminary Offer
                finalValuation: true, // Final Loan Offer
                images: true,
                createdAt: true,
                updatedAt: true,
                Loan: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        })
        return items
    } catch (error) {
        console.error("Error fetching user items:", error)
        return []
    }
}
