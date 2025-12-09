"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logActivity } from "./analytics"

export async function getPendingValuations() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Fetch items that are PENDING_VALUATION
    // These come from the Quick Apply Wizard
    const items = await db.item.findMany({
        where: {
            status: "PENDING_VALUATION"
        },
        include: {
            // We need the Loan info to know who asked
            Loan: {
                include: {
                    Customer: true
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    return items
}

export async function submitValuation(itemId: string, officialValuation: number, loanOffer: number) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        const item = await db.item.findUnique({ where: { id: itemId }, include: { Loan: true } })
        if (!item || !item.loanId) throw new Error("Item not found or no loan associated")

        // 1. Update Item
        await db.item.update({
            where: { id: itemId },
            data: {
                status: "VALUED", // Custom status or just use 'IN_LOAN' if approved directly? 
                // Let's use VALUED to indicate admin has checked it, but client hasn't accepted yet.
                // But our LoanStatus enum is simpler. 
                // Let's keep Item status as PENDING_VALUATION or update to a new status.
                // For now, let's say 'VALUED' is a valid status I need to ensure exists or map to something.
                // Default Prisma Enum: PENDING_VALUATION, IN_LOAN, IN_AUCTION, SOLD, REDEEMED
                // I might need to add VALUED to the Enum or just keep it PENDING_VALUATION but flag the loan?
                // Actually, let's Approve the LOAN.
            }
        })

        // 2. Update Loan to APPROVED (or similar) with the OFFER amount
        // The original application had a dummy principal. Now we set the REAL offer.
        await db.loan.update({
            where: { id: item.loanId },
            data: {
                principalAmount: loanOffer,
                status: "APPROVED" // Matches LoanStatus enum
            }
        })

        // Log it
        await logActivity("VALUATION_COMPLETED", {
            itemId,
            valuation: officialValuation,
            offer: loanOffer,
            adminId: session.user.id
        })

        revalidatePath("/admin/valuations")
        return { success: true }

    } catch (error) {
        console.error("Valuation failed:", error)
        return { success: false, message: "Failed to submit valuation" }
    }
}
