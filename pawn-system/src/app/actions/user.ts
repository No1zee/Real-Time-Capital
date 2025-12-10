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

    const bids = await prisma.bid.findMany({
        where: { userId: user.id },
        include: {
            Auction: {
                include: {
                    Item: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    })

    return bids.map((bid) => {
        const { Auction, ...restBid } = bid
        const { Item, ...restAuction } = Auction

        return {
            ...restBid,
            amount: Number(restBid.amount),
            auction: {
                ...restAuction,
                startPrice: Number(restAuction.startPrice),
                currentBid: restAuction.currentBid ? Number(restAuction.currentBid) : null,
                item: {
                    ...Item,
                    valuation: Number(Item.valuation),
                    salePrice: Item.salePrice ? Number(Item.salePrice) : null,
                }
            }
        }
    })
}
