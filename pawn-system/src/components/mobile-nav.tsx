"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, LayoutDashboard, FileText, Package, Gavel, Info, Mail, Heart, Bell, Users, PlusCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav({ user, unreadCount = 0 }: { user: any, unreadCount?: number }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
                )}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="fixed inset-y-0 left-0 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-2">
                            <Link href="/portal/auctions" onClick={() => setIsOpen(false)}>
                                <h1 className="text-2xl font-bold text-white cursor-pointer">
                                    <span className="text-amber-500">Real Time</span> Capital
                                </h1>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <nav className="space-y-1">
                                {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                                    <>
                                        <div className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            Admin Controls
                                        </div>
                                        <Link
                                            href="/admin/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Admin Dashboard
                                        </Link>
                                        <Link
                                            href="/admin/inventory"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Package className="w-5 h-5" />
                                            Inventory
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Users className="w-5 h-5" />
                                            Users
                                        </Link>
                                        <div className="my-4 border-t border-white/10" />
                                    </>
                                )}
                                <div className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    client portal
                                </div>
                                {user && (
                                    <>
                                        <Link
                                            href="/portal"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/portal/loans/apply"
                                            className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-lg font-bold"
                                            onClick={() => setOpen(false)}
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                            Apply for Loan
                                        </Link>

                                        <Link
                                            href="/portal/loans"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <FileText className="w-5 h-5" />
                                            My Loans
                                        </Link>
                                        <Link
                                            href="/portal/items"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Package className="w-5 h-5" />
                                            My Items
                                        </Link>
                                    </>
                                )}
                                <Link
                                    href="/portal/auctions"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <Gavel className="w-5 h-5" />
                                    Auctions
                                </Link>
                                {user && (
                                    <>
                                        <Link
                                            href="/portal/watchlist"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Heart className="w-5 h-5" />
                                            My Watchlist
                                        </Link>
                                        <Link
                                            href="/portal/notifications"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <div className="relative">
                                                <Bell className="w-5 h-5" />
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500" />
                                                )}
                                            </div>
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link
                                            href="/portal/education"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            Education Hub
                                        </Link>
                                    </>
                                )}

                                <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Support
                                </div>
                                <Link
                                    href="/portal/about"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <Info className="w-5 h-5" />
                                    About Us
                                </Link>
                                <Link
                                    href="/portal/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <Mail className="w-5 h-5" />
                                    Contact Us
                                </Link>
                            </nav>
                        </div>

                        {/* Footer (User Profile) */}
                        <div className="p-6 border-t border-white/10 bg-black/20">
                            {user ? (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <form action="/api/auth/signout" method="POST">
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 rounded-full"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20">
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
