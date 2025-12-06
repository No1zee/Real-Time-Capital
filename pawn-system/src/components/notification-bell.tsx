"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUnreadCount } from "@/app/actions/notification"

export function NotificationBell({ initialCount = 0 }: { initialCount?: number }) {
    const [count, setCount] = useState(initialCount)

    useEffect(() => {
        // Poll for notifications every 30 seconds
        const interval = setInterval(async () => {
            const newCount = await getUnreadCount()
            setCount(newCount)
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Link
            href="/portal/notifications"
            className="relative flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
        >
            <div className="relative">
                <Bell className="w-5 h-5" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </div>
            <span className="md:hidden lg:inline">Notifications</span>
        </Link>
    )
}
