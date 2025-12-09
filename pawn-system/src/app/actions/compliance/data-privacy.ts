"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/logger"

/**
 * Export all user data as JSON
 */
export async function exportUserData() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userId = session.user.id

    // Fetch all related data
    const [user, transactions, loans, items, bids, auditLogs] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.transaction.findMany({ where: { userId } }),
        prisma.loan.findMany({ where: { userId } }),
        prisma.item.findMany({ where: { userId } }),
        prisma.bid.findMany({ where: { userId } }),
        prisma.auditLog.findMany({ where: { userId } })
    ])

    const exportPackage = {
        profile: user,
        financial: {
            transactions,
            loans
        },
        activity: {
            items,
            bids,
            logs: auditLogs
        },
        exportedAt: new Date().toISOString()
    }

    // Log this action
    await logAudit({
        userId,
        action: "EXPORT_DATA",
        entityType: "USER",
        entityId: userId,
        details: { type: "FULL_EXPORT" }
    })

    return JSON.stringify(exportPackage, null, 2)
}

/**
 * Anonymize a user (Right to be Forgotten)
 * Keeps financial records but removes PII
 */
export async function anonymizeUser(targetUserId: string) {
    const session = await auth()

    // Only admins or the user themselves (with strict safeguards) can do this
    // For now, let's restrict to ADMIN only for safety
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) throw new Error("User not found")

    // Generate anonymous placeholder
    const anonId = `ANON-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Update user record
    await prisma.user.update({
        where: { id: targetUserId },
        data: {
            name: "Deleted User",
            email: `${anonId}@deleted.local`,
            image: null,
            password: null, // Remove ability to login
            isActive: false,
            // Clear PII if existing in other fields
            verificationStatus: "REJECTED",
        }
    })

    // Also need to consider Customer record if linked
    // ...

    await logAudit({
        userId: session.user.id!,
        action: "ANONYMIZE_USER",
        entityType: "USER",
        entityId: targetUserId,
        details: { originalEmail: user.email }
    })

    return { success: true, newEmail: `${anonId}@deleted.local` }
}
