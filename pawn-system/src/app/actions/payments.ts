"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function initiateDeposit(amount: number, method: "CASH" | "ECOCASH" | "ZIPIT", reference: string, proofOfPayment?: string) {
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
            proofOfPayment
        }
    })

    revalidatePath("/portal/wallet")
}

export async function simulateDeposit(amount: number, method: "ECOCASH", reference: string, proofOfPayment?: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    // Mock Simulation Delay handled in client or here? 
    // Server action should just do the DB write. Client can show spinner.

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount,
                type: "DEPOSIT",
                status: "COMPLETED", // Instant success
                method,
                reference,
                proofOfPayment
            }
        }),
        prisma.user.update({
            where: { id: user.id },
            data: { walletBalance: { increment: amount } }
        })
    ])

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
        include: { User: true }
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
        include: { User: { select: { name: true, email: true } } },
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

export type PaymentState = {
    message: string | null
    errors?: {
        amount?: string[]
        method?: string[]
        reference?: string[]
    }
}

export async function addPayment(prevState: PaymentState, formData: FormData): Promise<PaymentState> {
    const loanId = formData.get("loanId") as string
    const amountStr = formData.get("amount") as string
    const method = formData.get("method") as string
    const reference = formData.get("reference") as string

    // Validate
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
        return { message: "Invalid amount", errors: { amount: ["Amount must be greater than 0"] } }
    }

    try {
        await prisma.payment.create({
            data: {
                loanId,
                amount,
                method,
                reference: reference || `PAY-${Date.now()}`, // Fallback if user leaves it empty
                date: new Date()
            }
        })

        revalidatePath(`/portal/loans/${loanId}`)
        return { message: "Payment recorded successfully" }
    } catch (error) {
        console.error("Payment error:", error)
        return { message: "Failed to record payment" }
    }
}
