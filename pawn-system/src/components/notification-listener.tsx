"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getUnreadNotifications, markNotificationAsRead } from "@/app/actions/notification"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import confetti from "canvas-confetti"

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
                    // Don't mark as read immediately - let the badge show the unread count
                    // The toast callbacks (onDismiss, onAutoClose, onClick) will mark it as read
                    // await markNotificationAsRead(notification.id)
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

    const [winnerModalOpen, setWinnerModalOpen] = useState(false)
    const [winnerDetails, setWinnerDetails] = useState<{ title: string, message: string, link?: string } | null>(null)

    useEffect(() => {
        const checkNotifications = async () => {
            const notifications = await getUnreadNotifications()
            if (notifications && notifications.length > 0) {
                for (const notification of notifications) {

                    // Special handling for Win Notifications
                    if (notification.type === "AUCTION_WON") {
                        setWinnerDetails({
                            title: notification.title,
                            message: notification.message,
                            link: notification.link
                        })
                        setWinnerModalOpen(true)
                        // Mark as read immediately to prevent re-trigger on refresh
                        await markNotificationAsRead(notification.id)
                        continue // Skip standard toast for this one
                    }

                    toast(notification.title, {
                        description: notification.message,
                        duration: 3000,
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

                    // Don't mark as read immediately - let the badge show the unread count
                    // await markNotificationAsRead(notification.id)
                }
            }
        }

        checkNotifications()
        pollingRef.current = setInterval(checkNotifications, 5000)

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [router])

    useEffect(() => {
        if (winnerModalOpen) {
            const end = Date.now() + 3 * 1000;
            const colors = ['#d97706', '#ffffff', '#fcd34d'];

            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [winnerModalOpen])

    return (
        <Dialog open={winnerModalOpen} onOpenChange={setWinnerModalOpen}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-950 border-amber-200 dark:border-amber-900">
                <DialogHeader>
                    <div className="mx-auto bg-amber-100 dark:bg-amber-900/50 w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Trophy className="h-10 w-10 text-amber-600 dark:text-amber-500" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold text-amber-700 dark:text-amber-500">
                        {winnerDetails?.title || "Winner!"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-600 dark:text-slate-300 pt-2 text-base">
                        {winnerDetails?.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                        onClick={() => {
                            setWinnerModalOpen(false)
                            if (winnerDetails?.link) router.push(winnerDetails.link)
                        }}
                    >
                        Claim Your Item
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
