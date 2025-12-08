"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getWalletBalance() {
    const session = await auth()
    if (!session?.user?.id) return 0

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { walletBalance: true }
    })

    return Number(user?.walletBalance || 0)
}

export async function depositFunds(amount: number) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    if (amount <= 0) throw new Error("Invalid amount")

    await prisma.$transaction([
        prisma.user.update({
            where: { id: session.user.id },
            data: {
                walletBalance: { increment: amount }
            }
        }),
        prisma.transaction.create({
            data: {
                userId: session.user.id,
                amount,
                type: "DEPOSIT",
                method: "SYSTEM",
                reference: "Manual Deposit"
            }
        })
    ])

    revalidatePath("/portal/wallet")
    revalidatePath("/portal")
}

export async function getTransactions() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    })
}
