"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const paymentSchema = z.object({
    loanId: z.string(),
    amount: z.coerce.number().positive("Amount must be positive"),
    method: z.string().min(1, "Payment method is required"),
    reference: z.string().optional(),
})

export type PaymentState = {
    errors?: {
        amount?: string[]
        method?: string[]
        reference?: string[]
    }
    message?: string | null
}

export async function addPayment(prevState: PaymentState, formData: FormData) {
    const validatedFields = paymentSchema.safeParse({
        loanId: formData.get("loanId"),
        amount: formData.get("amount"),
        method: formData.get("method"),
        reference: formData.get("reference"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid payment details.",
        }
    }

    const { loanId, amount, method, reference } = validatedFields.data

    try {
        // 1. Get current loan details to check balance
        const loan = await db.loan.findUnique({
            where: { id: loanId },
            include: { payments: true },
        })

        if (!loan) {
            return { message: "Loan not found." }
        }

        // 2. Create Payment Record
        await db.payment.create({
            data: {
                loanId,
                amount,
                method,
                reference,
            },
        })

        // 3. Check if fully paid
        const currentPaid = loan.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
        const totalPaid = currentPaid + amount

        const principal = Number(loan.principalAmount)
        const interest = (principal * Number(loan.interestRate)) / 100
        const totalDue = principal + interest

        if (totalPaid >= totalDue - 0.01) { // Tolerance for floating point
            // Mark as COMPLETED and Item as REDEEMED
            await db.loan.update({
                where: { id: loanId },
                data: { status: "COMPLETED" },
            })

            // Find associated item and update
            const item = await db.item.findFirst({ where: { loanId } })
            if (item) {
                await db.item.update({
                    where: { id: item.id },
                    data: { status: "REDEEMED" },
                })
            }
        }

    } catch (error) {
        console.error("Payment Error:", error)
        return { message: "Failed to record payment." }
    }

    revalidatePath(`/loans/${loanId}`)
    revalidatePath("/loans")
    return { message: "Payment recorded successfully!" }
}
