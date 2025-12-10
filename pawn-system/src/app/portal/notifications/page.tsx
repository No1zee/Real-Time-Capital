import { getNotifications, markAllAsRead } from "@/app/actions/notification"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function NotificationsPage() {
    const notifications = await getNotifications()

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Stay updated on your auctions and account activity.
                    </p>
                </div>
                <form action={markAllAsRead}>
                    <Button variant="outline" className="gap-2">
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </Button>
                </form>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notifications</h3>
                        <p className="text-slate-500 dark:text-slate-400">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border transition-colors ${notification.isRead
                                ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'OUTBID'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500'
                                    }`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`font-medium ${notification.isRead
                                        ? 'text-slate-700 dark:text-slate-300'
                                        : 'text-slate-900 dark:text-slate-100'
                                        }`}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                        {notification.auctionId && (
                                            <Link
                                                href={`/portal/auctions/${notification.auctionId}`}
                                                className="text-amber-600 dark:text-amber-500 hover:underline font-medium"
                                            >
                                                View Auction
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
