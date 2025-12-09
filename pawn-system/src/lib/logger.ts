import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export type AuditAction =
    | "LOGIN"
    | "LOGOUT"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "VIEW_SENSITIVE"
    | "PERMISSION_CHANGE"
    | "CREATE_OFFER"
    | "ACCEPT_LOAN"
    | "EXPORT_DATA"
    | "ANONYMIZE_USER"
    | "PRINT_TICKET"
    | "VERIFY_IDENTITY"

export type AuditEntity =
    | "USER"
    | "LOAN"
    | "ITEM"
    | "AUCTION"
    | "SYSTEM"

interface LogAuditParams {
    userId: string
    action: AuditAction
    entityType: AuditEntity
    entityId?: string
    details?: Record<string, any>
}

export async function logAudit({ userId, action, entityType, entityId, details }: LogAuditParams) {
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
                details: details ? JSON.stringify(details) : undefined,
                ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
                userAgent
            }
        })
    } catch (error) {
        // Fail silently to not block the main action, but log to console
        console.error("Failed to log audit event:", error)
    }
}
