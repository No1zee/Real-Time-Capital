"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, LayoutDashboard, FileText, Package, Gavel, Info, Mail, Code, Heart, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav({ user, unreadCount = 0 }: { user: any, unreadCount?: number }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500" />
                )}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
                    <div
                        className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 shadow-xl transition-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <Link href="/portal/auctions" onClick={() => setIsOpen(false)}>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer">
                                    <span className="text-amber-500">Real Time</span> Capital
                                </h1>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="space-y-1">
                            {user && (
                                <>
                                    <Link
                                        href="/portal"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/portal/loans"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        My Loans
                                    </Link>
                                    <Link
                                        href="/portal/items"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        <Package className="w-5 h-5" />
                                        My Items
                                    </Link>
                                </>
                            )}
                            <Link
                                href="/portal/auctions"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <Gavel className="w-5 h-5" />
                                Auctions
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        href="/portal/watchlist"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        <Heart className="w-5 h-5" />
                                        My Watchlist
                                    </Link>
                                    <Link
                                        href="/portal/notifications"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    >
                                        <div className="relative">
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500" />
                                            )}
                                        </div>
                                        Notifications
                                        {unreadCount > 0 && (
                                            <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-500">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <Link
                                href="/portal/about"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <Info className="w-5 h-5" />
                                About Us
                            </Link>
                            <Link
                                href="/portal/contact"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                Contact Us
                            </Link>
                        </nav>

                        <div className="absolute bottom-6 left-6 right-6">
                            {user ? (
                                <>
                                    <div className="mb-4 px-4">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <form action="/api/auth/signout" method="POST">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
