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

    const customer = await prisma.customer.findFirst({
        where: { email: user.email },
        include: {
            Loan: {
                include: {
                    Item: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    return customer?.Loan || []
}

export async function getCustomerItems() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return []

    const customer = await prisma.customer.findFirst({
        where: { email: user.email },
        include: {
            Loan: {
                include: {
                    Item: true
                }
            }
        }
    })

    if (!customer) return []

    // Extract all items from all loans
    const items = customer.Loan.flatMap(loan => loan.Item)
    return items
}
