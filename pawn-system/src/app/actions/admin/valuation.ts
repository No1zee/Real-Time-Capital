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

    // Fetch items that are PENDING_VALUATION or PENDING_APPROVAL (for checker)
    const items = await db.item.findMany({
        where: {
            OR: [
                { status: "PENDING_VALUATION" },
                { valuationStatus: "PENDING_APPROVAL" }
            ]
        },
        include: {
            // We need the Loan info to know who asked
            Loan: {
                include: {
                    Customer: true
                }
            },
            Maker: {
                select: { name: true, id: true }
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

        // MAKER ACTION: Propose Valuation
        // 1. Update Item details but NOT final status
        await db.item.update({
            where: { id: itemId },
            data: {
                // status: "PENDING_VALUATION", // Keep as pending until approved? Or maybe we need a status for "PROPOSED"?
                // Let's rely on valuationStatus for the granular flow.
                valuationStatus: "PENDING_APPROVAL",

                marketValue: officialValuation,
                finalValuation: loanOffer,

                makerId: session.user.id,
                rejectionReason: null // Clear any previous rejection
            }
        })

        // Loan remains PENDING, not APPROVED yet.

        // Log it
        await logActivity("VALUATION_PROPOSED", {
            itemId,
            valuation: officialValuation,
            offer: loanOffer,
            makerId: session.user.id
        })

        revalidatePath("/admin/valuations")
        return { success: true, message: "Valuation submitted for approval" }

    } catch (error) {
        console.error("Valuation failed:", error)
        return { success: false, message: "Failed to submit valuation" }
    }
}

export async function approveValuation(itemId: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        const item = await db.item.findUnique({ where: { id: itemId }, include: { Loan: true } })
        if (!item || !item.loanId) throw new Error("Item not found")

        // 1. Verify 4-Eves Principle
        if (item.makerId === session.user.id) {
            return { success: false, message: "Maker cannot approve their own valuation." } // UI should prevent this too
        }

        // 2. CHECKER ACTION: Approve
        await db.item.update({
            where: { id: itemId },
            data: {
                status: "VALUED",
                valuationStatus: "OFFER_READY",

                checkerId: session.user.id,
                checkedAt: new Date()
            }
        })

        // 3. Update Loan to APPROVED
        await db.loan.update({
            where: { id: item.loanId },
            data: {
                principalAmount: item.finalValuation || 0, // Use the proposed amount
                status: "APPROVED",

                makerId: item.makerId, // Carry over to loan for references
                checkerId: session.user.id,
                checkedAt: new Date()
            }
        })

        await logActivity("VALUATION_APPROVED", {
            itemId,
            checkerId: session.user.id,
            makerId: item.makerId
        })

        revalidatePath("/admin/valuations")
        return { success: true, message: "Valuation approved and offer sent." }

    } catch (error) {
        console.error("Approval failed:", error)
        return { success: false, message: "Failed to approve valuation" }
    }
}

export async function rejectValuation(itemId: string, reason: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        await db.item.update({
            where: { id: itemId },
            data: {
                valuationStatus: "REJECTED_BY_CHECKER",
                rejectionReason: reason,
                // Status remains PENDING_VALUATION or effectively resets so it appears back in the queue?
                // If we set it to REJECTED_BY_CHECKER, it needs to be editable again.
                // The submitValuation function should handle re-submission.
            }
        })

        await logActivity("VALUATION_REJECTED", {
            itemId,
            checkerId: session.user.id,
            reason
        })

        revalidatePath("/admin/valuations")
        return { success: true, message: "Valuation returned to maker." }
    } catch (error) {
        console.error("Rejection failed:", error)
        return { success: false, message: "Failed to reject valuation" }
    }
}
