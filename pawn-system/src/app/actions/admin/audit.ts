"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { AuditAction, AuditEntity } from "@/lib/logger"

export interface AuditLogFilter {
    userId?: string
    action?: AuditAction
    entityType?: AuditEntity
    startDate?: Date
    endDate?: Date
}

export async function getAuditLogs(filter: AuditLogFilter = {}, page: number = 1, limit: number = 50) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    const where: any = {}

    if (filter.userId) where.userId = filter.userId
    if (filter.action) where.action = filter.action
    if (filter.entityType) where.entityType = filter.entityType

    if (filter.startDate || filter.endDate) {
        where.createdAt = {}
        if (filter.startDate) where.createdAt.gte = filter.startDate
        if (filter.endDate) where.createdAt.lte = filter.endDate
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.auditLog.count({ where })
    ])

    return {
        logs,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit
        }
    }
}

export async function exportAuditLogsToCSV(filter: AuditLogFilter = {}) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    const where: any = {}
    if (filter.userId) where.userId = filter.userId
    // ... apply same filters as above ...

    const logs = await prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5000 // Limit export size safety
    })

    const header = "Date,User,Action,Entity Type,Entity ID,Details,IP Address"
    const rows = logs.map(log => {
        const date = log.createdAt.toISOString()
        const user = log.user?.email || log.userId
        const details = log.details ? log.details.replace(/,/g, ";") : "" // Simple CSV escape
        return `${date},${user},${log.action},${log.entityType},${log.entityId || ""},${details},${log.ipAddress || ""}`
    })

    return [header, ...rows].join("\n")
}
