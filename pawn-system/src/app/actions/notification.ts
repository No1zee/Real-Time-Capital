"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createNotification(userId: string, type: string, message: string, auctionId?: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                auctionId,
            },
        })
    } catch (error) {
        console.error("Failed to create notification:", error)
    }
}

export async function getNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        })
        return notifications
    } catch (error) {
        console.error("Failed to fetch notifications:", error)
        return []
    }
}

export async function markAsRead(notificationId: string) {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
            data: {
                isRead: true,
            },
        })
        revalidatePath("/portal")
    } catch (error) {
        console.error("Failed to mark notification as read:", error)
    }
}

export async function markAllAsRead() {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        })
        revalidatePath("/portal")
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error)
    }
}

export async function getUnreadCount() {
    const session = await auth()
    if (!session?.user?.id) return 0

    try {
        return await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false,
            },
        })
    } catch (error) {
        return 0
    }
}
