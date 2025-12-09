"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"
import { redirect } from "next/navigation"
import { logActivity } from "@/app/actions/admin/analytics"

export async function createAuction(formData: FormData) {
    const session = await auth()
    const user = session?.user as any
    if (user?.role !== "STAFF" && user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const itemId = formData.get("itemId") as string
    const startPrice = Number(formData.get("startPrice"))
    const startTime = new Date(formData.get("startTime") as string)
    const endTime = new Date(formData.get("endTime") as string)

    if (!itemId || !startPrice || !startTime || !endTime) {
        throw new Error("Missing fields")
    }

    await prisma.auction.create({
        data: {
            id: crypto.randomUUID(),
            itemId,
            startPrice,
            startTime,
            endTime,
            status: "SCHEDULED",
        },
    })

    await prisma.item.update({
        where: { id: itemId },
        data: { status: "IN_AUCTION" },
    })

    revalidatePath("/auctions")
    redirect("/auctions")
}

export async function placeBid(auctionId: string, amount: number) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    if (user.role === "ADMIN" || user.role === "STAFF") {
        throw new Error("Administrators and staff cannot participate in auctions")
    }

    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { Item: true }
    })

    if (!auction) throw new Error("Auction not found")

    const currentPriceCheck = Number(auction.currentBid || auction.startPrice)
    // @ts-ignore
    const isHighValue = Number(auction.Item.valuation) > 1000 || currentPriceCheck > 1000

    if (isHighValue && user.verificationStatus !== "VERIFIED") {
        throw new Error("Identity verification required for high-value items")
    }

    const now = new Date()
    if (now < auction.startTime) throw new Error("Auction has not started")
    if (now > auction.endTime) throw new Error("Auction has ended")

    const currentPrice = Number(auction.currentBid || auction.startPrice)
    const minBid = currentPrice + 2

    if (amount < minBid) {
        throw new Error(`Bid must be at least ${minBid}`)
    }

    if (auction.isPractice) {
        if (Number(user.practiceBalance) < amount) {
            throw new Error("Insufficient practice funds")
        }
    } else {
        if (Number(user.walletBalance) < amount) {
            throw new Error("Insufficient funds in wallet")
        }
    }

    const previousHighestBid = await prisma.bid.findFirst({
        where: { auctionId },
        orderBy: { amount: "desc" },
        include: { User: true }
    })

    await prisma.$transaction([
        prisma.bid.create({
            data: {
                id: crypto.randomUUID(),
                amount,
                userId: user.id,
                auctionId,
            },
        }),
        prisma.auction.update({
            where: { id: auctionId },
            data: { currentBid: amount },
        }),
    ])

    if (previousHighestBid && previousHighestBid.userId !== user.id) {
        await createNotification(
            previousHighestBid.userId,
            "Outbid Alert",
            `You have been outbid! ${previousHighestBid.User?.name || "Someone"} placed a bid of ${amount}.`,
            "OUTBID",
            `/portal/auctions/${auctionId}`
        )
    }

    await processAutoBids(auctionId)

    revalidatePath(`/portal/auctions/${auctionId}`)
    revalidatePath(`/portal/auctions`)
}

export async function setAutoBid(auctionId: string, maxAmount: number) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    if (user.role === "ADMIN" || user.role === "STAFF") {
        throw new Error("Administrators and staff cannot participate in auctions")
    }

    // AutoBid composite key. No 'id' needed for update/upsert usually? 
    // Schema likely uses @@id([userId, auctionId]) or has id. 
    // Probe check for AutoBid? Error log didn't complain about AutoBid create missing ID?
    // Wait, probe.txt line 24 said: 'AutoBidUncheckedCreateInput': id, updatedAt property missing.
    // So YES, I need ID.
    // But upsert? 
    // 'create' inside upsert needs id.

    await prisma.autoBid.upsert({
        where: {
            userId_auctionId: {
                userId: user.id,
                auctionId,
            },
        },
        update: { maxAmount },
        create: {
            id: crypto.randomUUID(),
            userId: user.id,
            auctionId,
            maxAmount,
        },
    })

    await processAutoBids(auctionId)

    revalidatePath(`/portal/auctions/${auctionId}`)
}

async function processAutoBids(auctionId: string) {
    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
            Bid: {
                orderBy: { amount: "desc" },
                take: 1,
            },
            AutoBid: {
                orderBy: { maxAmount: "desc" },
            },
        },
    })

    if (!auction) return

    const currentBid = Number(auction.currentBid || auction.startPrice)
    const currentWinnerId = auction.Bid[0]?.userId
    const autoBids = auction.AutoBid

    const increment = 2
    const highestAuto = autoBids[0]
    const secondHighestAuto = autoBids[1]

    if (autoBids.length === 0) return

    if (highestAuto.userId === currentWinnerId) {
        if (secondHighestAuto) {
            const priceToDefend = Number(secondHighestAuto.maxAmount) + increment
            if (priceToDefend > currentBid && priceToDefend <= Number(highestAuto.maxAmount)) {
                await placeSystemBid(auctionId, highestAuto.userId, priceToDefend)
            }
        }
        return
    }

    if (Number(highestAuto.maxAmount) > currentBid) {
        const constraint = secondHighestAuto ? Number(secondHighestAuto.maxAmount) : 0
        const base = Math.max(currentBid, constraint)
        let newBid = base + increment

        if (newBid > Number(highestAuto.maxAmount)) {
            newBid = Number(highestAuto.maxAmount)
        }

        if (newBid > currentBid) {
            await placeSystemBid(auctionId, highestAuto.userId, newBid)
        }
    }
}

async function placeSystemBid(auctionId: string, userId: string, amount: number) {
    await prisma.$transaction([
        prisma.bid.create({
            data: {
                id: crypto.randomUUID(),
                auctionId,
                userId,
                amount,
            },
        }),
        prisma.auction.update({
            where: { id: auctionId },
            data: { currentBid: amount, status: "ACTIVE" },
        }),
    ])
}

export interface AuctionFilters {
    query?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sort?: string
}

export async function getAuctions(role: "STAFF" | "CUSTOMER" = "CUSTOMER", filters?: AuctionFilters, includeArchived: boolean = false) {
    const where: any = {}

    logActivity("SEARCH", { query: filters?.query })

    if (includeArchived) {
        where.status = { in: ["ENDED"] }
    } else {
        where.OR = [{ status: "ACTIVE" }, { status: "SCHEDULED" }]
    }

    if (filters?.query) {
        where.Item = {
            OR: [
                { name: { contains: filters.query } },
                { description: { contains: filters.query } }
            ]
        }
    }

    if (filters?.category && filters.category !== "All") {
        where.Item = {
            ...where.Item,
            category: filters.category
        }
    }

    const orderBy: any = filters?.sort === "price_asc" ? { startPrice: "asc" } : { endTime: "asc" }

    return await prisma.auction.findMany({
        where,
        include: { Item: true, _count: { select: { Bid: true } } },
        orderBy,
    })
}

export async function getAuction(id: string) {
    return await prisma.auction.findUnique({
        where: { id },
        include: {
            Item: true,
            Bid: {
                include: { User: { select: { name: true } } },
                orderBy: { amount: "desc" }
            },
            AutoBid: {
                where: { userId: (await auth())?.user?.id },
            }
        }
    })
}

export async function getUnredeemedItems() {
    return await prisma.item.findMany({
        where: {
            status: "PAWNED",
            Loan: { status: "DEFAULTED" },
            Auction: { is: null }
        }
    })
}
