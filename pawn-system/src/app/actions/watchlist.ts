"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleWatchlist(auctionId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    try {
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_auctionId: {
                    userId,
                    auctionId,
                },
            },
        })

        if (existing) {
            await prisma.watchlist.delete({
                where: {
                    userId_auctionId: {
                        userId,
                        auctionId,
                    },
                },
            })
            revalidatePath("/portal/watchlist")
            revalidatePath("/portal/auctions")
            revalidatePath(`/portal/auctions/${auctionId}`)
            return { isWatched: false }
        } else {
            await prisma.watchlist.create({
                data: {
                    userId,
                    auctionId,
                },
            })
            revalidatePath("/portal/watchlist")
            revalidatePath("/portal/auctions")
            revalidatePath(`/portal/auctions/${auctionId}`)
            return { isWatched: true }
        }
    } catch (error) {
        console.error("Failed to toggle watchlist:", error)
        throw new Error("Failed to update watchlist")
    }
}

export async function getWatchlist() {
    const session = await auth()
    if (!session?.user?.id) {
        return []
    }

    const userId = session.user.id

    try {
        const watchlist = await prisma.watchlist.findMany({
            where: {
                userId,
            },
            include: {
                auction: {
                    include: {
                        item: true,
                        bids: {
                            orderBy: {
                                amount: 'desc'
                            },
                            take: 1
                        }
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return watchlist.map((w: any) => w.auction)
    } catch (error) {
        console.error("Failed to get watchlist:", error)
        return []
    }
}

export async function isWatched(auctionId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return false
    }

    const userId = session.user.id

    const count = await prisma.watchlist.count({
        where: {
            userId,
            auctionId,
        },
    })

    return count > 0
}
