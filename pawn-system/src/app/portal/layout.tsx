
import { auth } from "@/auth"
import { logout } from "@/app/actions/auth"
import Link from "next/link"
import { LogOut, LayoutDashboard, FileText, Package, Gavel, Info, Mail, Heart, Bell, Shield, Wallet } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { TrustScore } from "@/components/trust-score"
import { ThemeSwitcher } from "@/components/theme-switcher"

import { getUnreadCount } from "@/app/actions/notification"
import { PageAnimation } from "@/components/page-animation"

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-amber-500/30">
            {/* Sidebar - Glassy & Premium */}
            <aside className="w-64 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border hidden md:flex flex-col z-20 relative shadow-2xl">
                <div className="p-6 border-b border-sidebar-border space-y-4">
                    <Link href="/portal/auctions">
                        <h1 className="text-2xl font-bold text-sidebar-foreground cursor-pointer tracking-tight">
                            <span className="text-primary">Real Time</span> Capital
                        </h1>
                    </Link>
                    {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                        <div className="mt-2 text-xs">
                            <TrustScore />
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {user && (
                        <div className="mb-8">
                            <Link href="/portal/profile">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/10 border border-sidebar-border hover:border-primary/30 hover:bg-sidebar-accent/20 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-105 transition-transform ring-1 ring-primary/20">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span>{user.name?.[0] || "U"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                                            {user.name || "User"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate group-hover:text-sidebar-foreground">
                                            View Profile
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/portal/auctions"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                    >
                        <Gavel className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Auctions
                    </Link>

                    {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-lg transition-all group font-medium hover:bg-primary/20"
                        >
                            <Shield className="w-5 h-5" />
                            Admin Dashboard
                        </Link>
                    )}

                    {user && (
                        <>
                            <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Menu
                            </div>
                            <Link
                                href="/portal"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <LayoutDashboard className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                                Dashboard
                            </Link>
                            <Link
                                href="/portal/loans/apply"
                                className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all group font-bold mb-2 border border-primary/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                Apply for Loan
                            </Link>

                            <Link
                                href="/portal/loans"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <FileText className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                                My Loans
                            </Link>
                            <Link
                                href="/portal/items"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <Package className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                                My Items
                            </Link>
                            <Link
                                href="/portal/wallet"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <Wallet className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                                My Wallet
                            </Link>
                            <Link
                                href="/portal/watchlist"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <Heart className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                                My Watchlist
                            </Link>
                            <Link
                                href="/portal/education"
                                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:text-blue-400 transition-colors"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                Education Hub
                            </Link>
                        </>
                    )}

                    {user && (
                        <div className="px-4 py-2">
                            <NotificationBell initialCount={await getUnreadCount()} />
                        </div>
                    )}

                    <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Support
                    </div>
                    <Link
                        href="/portal/about"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                    >
                        <Info className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                        About Us
                    </Link>
                    <Link
                        href="/portal/contact"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-all group"
                    >
                        <Mail className="w-5 h-5 group-hover:text-pink-400 transition-colors" />
                        Contact Us
                    </Link>
                </nav>

                <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
                    <div className="flex justify-end mb-4">
                        <ThemeSwitcher />
                    </div>
                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                Signed in as <br />
                                <span className="text-sidebar-foreground font-medium">{user.email}</span>
                            </div>
                            <form action={logout}>
                                <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative z-0 bg-background">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between sticky top-0 z-50">
                    <Link href="/portal/auctions">
                        <h1 className="text-xl font-bold text-sidebar-foreground cursor-pointer">
                            <span className="text-primary">Real Time</span> Capital
                        </h1>
                    </Link>
                    <MobileNav user={user} unreadCount={user ? await getUnreadCount() : 0} />
                </div>

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <PageAnimation>
                        {children}
                    </PageAnimation>
                </div>
            </main>
        </div>
    )
}
