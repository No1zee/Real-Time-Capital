"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"

export async function getAllUsers(query?: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "STAFF")) {
        throw new Error("Unauthorized")
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    Bid: true,
                    Transaction: true
                }
            }
        },
        where: query ? {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } }
            ]
        } : undefined
    })

    return users
}

export async function updateUserRole(userId: string, role: UserRole) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can change roles")
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role, permissions: "" }
    })

    revalidatePath("/admin/users")
}

export async function updateUserPermissions(userId: string, permissions: string[]) {
    const session = await auth()
    const currentUser = session?.user as any

    if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Unauthorized: Only Admins can update permissions")
    }

    await prisma.user.update({
        where: { id: userId },
        data: { permissions: permissions.join(",") }
    })

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${userId}`)
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
