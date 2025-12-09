"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = "SYSTEM",
    link?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to create notification:", error)
        return { success: false, error: "Failed to create notification" }
    }
}

export async function getUnreadNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                isRead: false
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10 // Limit checking for last 10 unread
        })
        return notifications
    } catch (error) {
        console.error("Failed to fetch notifications:", error)
        return []
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id
            },
            data: {
                isRead: true
            }
        })
        revalidatePath("/portal")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark notification read:", error)
        return { success: false }
    }
}
