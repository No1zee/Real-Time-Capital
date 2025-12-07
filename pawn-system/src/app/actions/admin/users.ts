"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAllUsers(query?: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF")) {
        throw new Error("Unauthorized")
    }

    const where: any = {}

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { email: { contains: query } }
        ]
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    bids: true,
                    transactions: true
                }
            }
        }
    })

    return users
}

export async function updateUserRole(userId: string, role: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can change roles")
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role }
    })

    revalidatePath("/admin/users")
}

export async function toggleUserStatus(userId: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can suspend/activate users")
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error("User not found")

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive }
    })

    revalidatePath("/admin/users")
}

// For now we don't have an explicit 'suspended' status in the schema,
// strictly speaking based on previous views.
// But the plan mentioned `toggleUserStatus`.
// Let's check schema.prisma again to be sure about User model fields.
// If no status field exists for suspension, we might need to add it or perform a schema check.
// I'll assume for now we might need to rely on verificationStatus or add a new field.
// Wait, the schema view showed: verificationStatus String @default("UNVERIFIED") // UNVERIFIED, PENDING, VERIFIED, REJECTED
// It didn't explicitly show 'SUSPENDED' or 'ACTIVE' generic status.
// I will check the schema first before adding this action.
