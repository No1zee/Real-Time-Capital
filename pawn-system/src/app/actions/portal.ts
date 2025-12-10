"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getCustomerLoans() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return []

    // Try finding customer by National ID first (most reliable for Loan Apps)
    let customer = null

    if (user.nationalId) {
        customer = await prisma.customer.findUnique({
            where: { nationalId: user.nationalId },
            include: {
                Loan: {
                    include: { Item: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
    }

    // Fallback to Email if no National ID match
    if (!customer) {
        customer = await prisma.customer.findFirst({
            where: { email: user.email },
            include: {
                Loan: {
                    include: { Item: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
    }

    return customer?.Loan || []
}

export async function getCustomerItems() {
    const session = await auth()
    if (!session?.user?.id) return { wonItems: [], pawnedItems: [] }

    // Get items won in auctions (user owns them)
    const wonItems = await prisma.item.findMany({
        where: {
            userId: session.user.id,
            status: "SOLD" // Items purchased from auctions
        },
        orderBy: { soldAt: "desc" }
    })

    // Get items held as collateral (pawned items)
    const pawnedItems = await prisma.item.findMany({
        where: {
            loanId: { not: null },
            Loan: {
                userId: session.user.id,
                status: { in: ["ACTIVE", "APPROVED", "PENDING"] } // Active collateral
            }
        },
        include: {
            Loan: {
                select: {
                    id: true,
                    status: true,
                    dueDate: true,
                    principalAmount: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return { wonItems, pawnedItems }
}
