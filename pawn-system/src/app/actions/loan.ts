"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/logger"
import { redirect } from "next/navigation"
import { createNotification } from "./notification"

export async function createLoanOffer(itemId: string, principal: number, rate: number, days: number) {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        const item = await prisma.item.findUnique({ where: { id: itemId } })
        if (!item || !item.userId) throw new Error("Item not found or invalid owner")

        // Create the Loan in PENDING status
        const loan = await prisma.loan.create({
            data: {
                userId: item.userId,
                principalAmount: principal,
                interestRate: rate,
                durationDays: days,
                status: "PENDING",
                dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
                items: {
                    connect: { id: itemId }
                }
            }
        })

        // Log
        await logAudit({
            userId: session.user.id as string,
            action: "CREATE_OFFER",
            entityType: "LOAN",
            entityId: loan.id,
            details: { principal, rate, days, itemId }
        })

        // Notify User
        await createNotification(
            item.userId,
            "Loan Offer Ready",
            `A loan offer of $${principal} is ready for regular review.`,
            "LOAN_OFFER",
            "/portal/loans/offers"
        )

        revalidatePath("/admin/valuations")
        return { success: true, loanId: loan.id }
    } catch (error) {
        console.error("Create Offer Error:", error)
        return { success: false, error: "Failed to create offer" }
    }
}

export async function acceptLoanOffer(loanId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { user: true } // to get wallet info later if needed
        })

        if (!loan || loan.userId !== session.user.id) {
            throw new Error("Loan not found or unauthorized")
        }

        if (loan.status !== "PENDING") {
            throw new Error("Loan is not pending")
        }

        // Activate Loan transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Loan
            await tx.loan.update({
                where: { id: loanId },
                data: { status: "ACTIVE", startDate: new Date() }
            })

            // 2. Add Funds to Wallet
            await tx.user.update({
                where: { id: loan.userId as string },
                data: { walletBalance: { increment: loan.principalAmount } }
            })

            // 3. Mark Items as PAWNED
            await tx.item.updateMany({
                where: { loanId: loanId },
                data: { status: "PAWNED" }
            })

            // 4. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId: loan.userId as string,
                    amount: loan.principalAmount,
                    type: "DEPOSIT", // Or "LOAN_DISBURSEMENT" if we had that enum
                    status: "COMPLETED",
                    method: "SYSTEM",
                    reference: `LOAN-${loan.id}`
                }
            })
        })

        await logAudit({
            userId: session.user.id,
            action: "ACCEPT_LOAN",
            entityType: "LOAN",
            entityId: loanId,
            details: { amount: loan.principalAmount }
        })

        revalidatePath("/portal/loans")
        return { success: true }
    } catch (error) {
        console.error("Accept Offer Error:", error)
        return { success: false, error: "Failed to accept offer" }
    }
}
