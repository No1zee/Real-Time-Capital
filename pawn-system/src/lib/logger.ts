import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

interface LogAuditParams {
    userId: string
    action: string
    entityType: string
    entityId?: string
    details?: any
}

export async function logAudit({ userId, action, entityType, entityId, details }: LogAuditParams) {
    // Req 4c: Audit Trail
    try {
        const headersList = await headers()
        const ipAddress = headersList.get("x-forwarded-for") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                details: JSON.stringify(details || {}),
                ipAddress,
                userAgent,
            }
        })

        // Also log to console for immediate visibility during dev
        console.log(`[AUDIT] [${action}] User:${userId} Resource:${entityType} IP:${ipAddress}`)

    } catch (error) {
        // Fallback: don't crash the app if audit logging fails
        console.error("Audit log failed:", error)
    }
}
