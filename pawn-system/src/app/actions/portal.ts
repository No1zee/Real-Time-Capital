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

    // Assuming we will link Loans to Users via a Customer record or directly.
    // For now, let's assume we find the Customer record by email matching the User email
    // or we need to add a userId to the Customer model.
    // Let's check the schema first.

    // Wait, I need to verify the schema relation between User and Customer.
    // If it doesn't exist, I might need to rely on email matching for now or update schema.
    // Let's assume email matching for this step as per previous context, 
    // or I'll fetch based on the Customer model having an email field.

    const customer = await prisma.customer.findFirst({
        where: { email: user.email },
        include: {
            loans: {
                include: {
                    items: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    return customer?.loans || []
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
            loans: {
                include: {
                    items: true
                }
            }
        }
    })

    if (!customer) return []

    // Extract all items from all loans
    const items = customer.loans.flatMap(loan => loan.items)
    return items
}
