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

import { UserRole } from "@prisma/client"

export async function updateUserRole(userId: string, role: UserRole) {
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

export async function updateUserPermissions(userId: string, permissions: string[]) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can manage permissions")
    }

    await prisma.user.update({
        where: { id: userId },
        data: { permissions }
    })

    revalidatePath(`/admin/users/${userId}`)
}
