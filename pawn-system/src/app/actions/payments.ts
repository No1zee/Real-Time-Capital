"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function initiateDeposit(amount: number, method: "CASH" | "ECOCASH" | "ZIPIT", reference: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    await prisma.transaction.create({
        data: {
            userId: user.id,
            amount,
            type: "DEPOSIT",
            status: "PENDING",
            method,
            reference,
        }
    })

    revalidatePath("/portal/wallet")
}

export async function verifyTransaction(transactionId: string, action: "APPROVE" | "REJECT") {
    const session = await auth()
    const user = session?.user as any

    // Check if admin/staff
    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true }
    })

    if (!transaction) throw new Error("Transaction not found")
    if (transaction.status !== "PENDING") throw new Error("Transaction already processed")

    if (action === "APPROVE") {
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: transactionId },
                data: { status: "COMPLETED" }
            }),
            prisma.user.update({
                where: { id: transaction.userId },
                data: { walletBalance: { increment: transaction.amount } }
            })
        ])
    } else {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "REJECTED" }
        })
    }

    revalidatePath("/admin/dashboard")
}

export async function getPendingTransactions() {
    const session = await auth()
    const user = session?.user as any

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    return await prisma.transaction.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" }
    })
}

export async function getUserTransactions() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    return await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    })
}
