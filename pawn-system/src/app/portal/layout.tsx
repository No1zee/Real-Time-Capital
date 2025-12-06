
import { auth } from "@/auth"
import { logout } from "@/app/actions/auth"
import Link from "next/link"
import { LogOut, LayoutDashboard, FileText, Package, Gavel, Info, Mail, Code, Heart } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { getUnreadCount } from "@/app/actions/notification"

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <Link href="/portal/auctions">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer">
                            <span className="text-amber-500">Real Time</span> Capital
                        </h1>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {user && (
                        <div className="mb-6">
                            <Link href="/portal/profile">
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold group-hover:scale-105 transition-transform">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span>{user.name?.[0] || "U"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                            {user.name || "User"}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            View Profile
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/portal/auctions"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <Gavel className="w-5 h-5" />
                        Auctions
                    </Link>

                    {user && (
                        <>
                            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Menu
                            </div>
                            <Link
                                href="/portal"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                            </Link>
                            <Link
                                href="/portal/loans"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                My Loans
                            </Link>
                            <Link
                                href="/portal/items"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <Package className="w-5 h-5" />
                                My Items
                            </Link>
                            <Link
                                href="/portal/watchlist"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <Heart className="w-5 h-5" />
                                My Watchlist
                            </Link>
                        </>
                    )}
                    {user && (
                        <NotificationBell initialCount={await getUnreadCount()} />
                    )}
                    <Link
                        href="/portal/about"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <Info className="w-5 h-5" />
                        About Us
                    </Link>
                    <Link
                        href="/portal/contact"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        Contact Us
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold">
                                {user.name?.[0] || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                            <form action={logout}>
                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <Link href="/portal/auctions">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer">
                            <span className="text-amber-500">Real Time</span> Capital
                        </h1>
                    </Link>
                    <MobileNav user={user} unreadCount={user ? await getUnreadCount() : 0} />
                </div>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
