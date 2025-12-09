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
                Auction: { // Casing for relation: Auction
                    include: {
                        Item: true, // Casing for relation: Item
                        Bid: {
                            orderBy: {
                                amount: 'desc'
                            },
                            take: 1,
                            include: {
                                User: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Fetch user's bids for these auctions to determine status
        const auctionIds = watchlist.map((w) => w.auctionId)
        const userBids = await prisma.bid.findMany({
            where: {
                userId,
                auctionId: {
                    in: auctionIds
                }
            },
            select: {
                auctionId: true,
                amount: true
            }
        })

        return watchlist.map((w: any) => {
            const auction = w.Auction // Access via PascalCase relation
            const highestBid = auction.Bid?.[0]
            const myBids = userBids.filter((b) => b.auctionId === auction.id)
            const myHighestBid = myBids.sort((a, b) => Number(b.amount) - Number(a.amount))[0]

            let userStatus = "NO_BID"
            if (myHighestBid) {
                if (highestBid && highestBid.User.id === userId) {
                    userStatus = "WINNING"
                } else {
                    userStatus = "OUTBID"
                }
            }

            if (auction.status === "COMPLETED" || auction.status === "SOLD") {
                if (userStatus === "WINNING") userStatus = "WON"
                else if (userStatus === "OUTBID") userStatus = "LOST"
            }

            return { ...auction, userStatus }
        })
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
