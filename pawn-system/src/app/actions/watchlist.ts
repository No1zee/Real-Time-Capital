"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleWatchlist(auctionId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    try {
        const existing = await db.watchlist.findUnique({
            where: {
                userId_auctionId: {
                    userId: session.user.id,
                    auctionId
                }
            }
        })

        if (existing) {
            await db.watchlist.delete({
                where: {
                    userId_auctionId: {
                        userId: session.user.id,
                        auctionId
                    }
                }
            })
            revalidatePath("/portal/auctions")
            return { success: true, message: "Removed from watchlist", active: false }
        } else {
            await db.watchlist.create({
                data: {
                    userId: session.user.id,
                    auctionId
                }
            })
            revalidatePath("/portal/auctions")
            return { success: true, message: "Added to watchlist", active: true }
        }
    } catch (e) {
        return { success: false, message: "Failed to update watchlist" }
    }
}

export async function getWatchlistStatus(auctionId: string) {
    const session = await auth()
    if (!session?.user?.id) return false

    const entry = await db.watchlist.findUnique({
        where: {
            userId_auctionId: {
                userId: session.user.id,
                auctionId
            }
        }
    })
    return !!entry
}
