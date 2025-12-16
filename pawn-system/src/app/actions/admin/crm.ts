"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- Helper for Permissions ---
async function checkAdminAccess() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, permissions: true } // Fetch permissions
    })

    if (!user) throw new Error("User not found")

    // Admin has full access. Staff needs explicit permission.
    const hasAccess =
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        (user.role === "STAFF" && user.permissions.includes("CRM_ACCESS"))

    if (!hasAccess) {
        throw new Error("Insufficient Permissions: CRM Access Required")
    }

    return user
}

// --- Notes ---

export async function addCRMNote(userId: string, content: string) {
    const admin = await checkAdminAccess()

    const note = await prisma.cRMNote.create({
        data: {
            userId,
            authorId: admin.id,
            content
        }
    })

    revalidatePath(`/admin/users/${userId}`)
    return note
}

export async function getCRMNotes(userId: string) {
    await checkAdminAccess()

    return await prisma.cRMNote.findMany({
        where: { userId },
        include: { Author: { select: { name: true, image: true, role: true } } },
        orderBy: { createdAt: 'desc' }
    })
}

// --- Tasks ---

export async function createCRMTask(userId: string, title: string, description?: string, dueDate?: Date, priority: string = "MEDIUM") {
    const admin = await checkAdminAccess()

    const task = await prisma.cRMTask.create({
        data: {
            userId,
            title,
            description,
            priority,
            dueDate,
            assigneeId: admin.id // Auto-assign to creator for now, or allow selecting
        }
    })

    revalidatePath(`/admin/users/${userId}`)
    return task
}

export async function updateCRMTaskStatus(taskId: string, status: string, userId: string) {
    await checkAdminAccess()

    await prisma.cRMTask.update({
        where: { id: taskId },
        data: { status }
    })

    revalidatePath(`/admin/users/${userId}`)
}

export async function getCRMTasks(userId: string) {
    await checkAdminAccess()

    return await prisma.cRMTask.findMany({
        where: { userId },
        include: { Assignee: { select: { name: true, image: true } } },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
    })
}

// --- Logs ---

export async function logInteraction(userId: string, type: string, summary: string, details?: string) {
    const admin = await checkAdminAccess()

    const log = await prisma.cRMLog.create({
        data: {
            userId,
            authorId: admin.id,
            type,
            summary,
            details
        }
    })

    revalidatePath(`/admin/users/${userId}`)
    return log
}

export async function getInteractionLogs(userId: string) {
    await checkAdminAccess()

    return await prisma.cRMLog.findMany({
        where: { userId },
        include: { Author: { select: { name: true } } },
        orderBy: { date: 'desc' }
    })
}

// --- Tags ---

export async function getAvailableTags() {
    await checkAdminAccess()
    return await prisma.cRMTag.findMany()
}

export async function createTag(name: string, color: string) {
    await checkAdminAccess()

    return await prisma.cRMTag.create({
        data: { name, color }
    })
}

export async function assignTag(userId: string, tagId: string) {
    await checkAdminAccess()

    // Check if exists
    const existing = await prisma.userCRMTag.findUnique({
        where: { userId_tagId: { userId, tagId } }
    })

    if (!existing) {
        await prisma.userCRMTag.create({
            data: { userId, tagId }
        })
    }

    revalidatePath(`/admin/users/${userId}`)
}

export async function getAvailableTagsForUser(userId: string) {
    await checkAdminAccess()

    const userTags = await prisma.userCRMTag.findMany({
        where: { userId },
        include: { tag: true }
    })

    return userTags.map(ut => ut.tag)
}
