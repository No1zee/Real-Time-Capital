"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getUnreadNotifications, markNotificationAsRead } from "@/app/actions/notification"

export function NotificationListener() {
    const router = useRouter()
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const checkNotifications = async () => {
            const notifications = await getUnreadNotifications()
            if (notifications && notifications.length > 0) {
                for (const notification of notifications) {
                    toast(notification.title, {
                        description: notification.message,
                        duration: 2000, // 2 seconds as requested
                        action: {
                            label: "View",
                            onClick: async () => {
                                if (notification.link) {
                                    router.push(notification.link)
                                }
                                await markNotificationAsRead(notification.id)
                            }
                        },
                        onDismiss: async () => {
                            await markNotificationAsRead(notification.id)
                        },
                        onAutoClose: async () => {
                            await markNotificationAsRead(notification.id)
                        }
                    })
                    // Mark as read immediately when shown to avoid repetition? 
                    // No, requirements say "gives them a chance to click". 
                    // But if it polls again in 10s, it might show again if not marked read.
                    // Let's mark it as read when the toast appears BUT we rely on the user action or auto-dismiss.
                    // ACTUALLY, to prevent double-toast, we should mark it as read immediately or track "shown" state locally.
                    // Simplest: Mark as read immediately after firing the toast, effectively "delivering" it.
                    await markNotificationAsRead(notification.id)
                }
            }
        }

        // Initial check
        checkNotifications()

        // Poll every 5 seconds
        pollingRef.current = setInterval(checkNotifications, 5000)

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [router])

    return null
}
