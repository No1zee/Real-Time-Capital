"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Banknote,
    Gavel,
    Package,
    Settings,
    LogOut,
    Users,
    Wallet,
    Shield,
    CreditCard,
    FileBarChart,
    ArrowLeft,
    Heart,
    Info,
    Mail,
    FileText,
    Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getUnreadCount } from "@/app/actions/notification"

type SidebarVariant = "default" | "admin" | "portal"

interface NavItem {
    name: string
    href: string
    icon: any
    roles: string[]
    header?: string
    className?: string
}

interface AppSidebarProps {
    user: any // keeping loose for now to align with existing usage
    variant?: SidebarVariant
    trustScore?: React.ReactNode
    className?: string
}

export function AppSidebar({ user, variant = "default", trustScore, className }: AppSidebarProps) {
    const pathname = usePathname()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (variant === "portal" && user) {
            // Initial fetch
            getUnreadCount().then((count) => {
                console.log('[AppSidebar] Initial unread count:', count)
                setUnreadCount(count)
            })

            // Poll every 5 seconds
            const interval = setInterval(async () => {
                const count = await getUnreadCount()
                console.log('[AppSidebar] Polled unread count:', count)
                setUnreadCount(count)
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [variant, user])

    const userRole = user?.role || "GUEST"

    // --- Configuration ---

    // 1. Navigation Items
    const navItems: Record<SidebarVariant, NavItem[]> = {
        default: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
            { name: "Loans", href: "/loans", icon: Banknote, roles: ["ADMIN", "STAFF"] },
            { name: "My Loans", href: "/portal/loans", icon: Banknote, roles: ["CUSTOMER"] },
            { name: "Inventory", href: "/inventory", icon: Package, roles: ["ADMIN", "STAFF"] },
            { name: "My Inventory", href: "/portal/inventory", icon: Package, roles: ["CUSTOMER"] },
            { name: "Auctions", href: "/auctions", icon: Gavel, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
            { name: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
            { name: "My Wallet", href: "/portal/wallet", icon: Wallet, roles: ["CUSTOMER"] },
            { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
        ],
        admin: [
            { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF"] },
            { name: "User Management", href: "/admin/users", icon: Users, roles: ["ADMIN", "STAFF"] },
            { name: "Global Inventory", href: "/admin/inventory", icon: Package, roles: ["ADMIN", "STAFF"] },
            { name: "Valuations", href: "/admin/valuations", icon: Banknote, roles: ["ADMIN", "STAFF"], className: "text-amber-500" },
            { name: "Auctions", href: "/admin/auctions", icon: Gavel, roles: ["ADMIN", "STAFF"] },
            { name: "Payments", href: "/admin/payments", icon: CreditCard, roles: ["ADMIN", "STAFF"] },
            { name: "Reports", href: "/admin/reports", icon: FileBarChart, roles: ["ADMIN", "STAFF"] },
            { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN", "STAFF"] },
        ],
        portal: [
            // For Admin/Staff in Portal specific view
            { name: "Admin Dashboard", href: "/admin/dashboard", icon: Shield, roles: ["ADMIN", "STAFF"], className: "text-primary bg-primary/10 hover:bg-primary/20" },

            // Common Portal Items
            { name: "Auctions", href: "/portal/auctions", icon: Gavel, roles: ["ADMIN", "STAFF", "CUSTOMER", "GUEST"] },

            // Customer Specific
            { name: "Dashboard", href: "/portal", icon: LayoutDashboard, roles: ["CUSTOMER"], header: "Menu" },
            { name: "My Loans", href: "/portal/loans", icon: FileText, roles: ["CUSTOMER"] },
            { name: "My Items", href: "/portal/items", icon: Package, roles: ["CUSTOMER"] },
            { name: "My Wallet", href: "/portal/wallet", icon: Wallet, roles: ["CUSTOMER"] },
            { name: "My Watchlist", href: "/portal/watchlist", icon: Heart, roles: ["CUSTOMER"] },
            // New Feature: Online Pawn
            { name: "Get a Valuation", href: "/portal/pawn", icon: Banknote, roles: ["CUSTOMER"], className: "text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 font-bold" },

            // Education & Support (Available to all)
            { name: "Education Hub", href: "/portal/education", icon: BookOpenIcon, roles: ["ADMIN", "STAFF", "CUSTOMER", "GUEST"] },
            { name: "About Us", href: "/portal/about", icon: Info, roles: ["ADMIN", "STAFF", "CUSTOMER", "GUEST"], header: "Support" },
            { name: "Contact Us", href: "/portal/contact", icon: Mail, roles: ["ADMIN", "STAFF", "CUSTOMER", "GUEST"] },
        ]
    }

    // Helper for Portal Education Icon
    function BookOpenIcon(props: any) {
        return (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        )
    }


    const currentNavItems = navItems[variant] || navItems.default
    const filteredNavItems = currentNavItems.filter(item => {
        if (item.roles && !item.roles.includes(userRole)) return false
        return true
    })

    // --- Components ---

    const SidebarHeader = () => {
        if (variant === "admin") {
            return (
                <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="font-bold tracking-tight text-sidebar-foreground">Admin Center</span>
                    </div>
                </div>
            )
        }
        // Portal & Default Header
        return (
            <div className="p-6 border-b border-sidebar-border space-y-4">
                <Link href={variant === "portal" ? "/portal/auctions" : "/"}>
                    {variant === "portal" ? (
                        <h1 className="text-2xl font-bold text-sidebar-foreground cursor-pointer tracking-tight">
                            <span className="text-primary">Real Time</span> Capital
                        </h1>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="font-bold text-primary-foreground text-lg">R</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">Real Time Capital</h1>
                        </div>
                    )}
                </Link>
                {variant === "portal" && (userRole === "ADMIN" || userRole === "STAFF") && trustScore && (
                    <div className="mt-2 text-xs">
                        {trustScore}
                    </div>
                )}
            </div>
        )
    }

    const UserProfile = ({ count }: { count: number }) => {
        if (variant !== "portal" || !user) return null
        return (
            <div className="mb-8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/10 border border-sidebar-border transition-all">
                    <Link href="/portal/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
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
                    </Link>

                    {/* Notification Bell Icon */}
                    <Link href="/portal/notifications" className="relative p-2 hover:bg-sidebar-accent/20 rounded-lg transition-colors">
                        <Bell className="w-5 h-5 text-muted-foreground hover:text-sidebar-foreground transition-colors" />
                        {count > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-sidebar">
                                {count > 9 ? "9+" : count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <aside className={cn(
            "flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative z-20 shadow-2xl",
            variant === "portal" ? "w-64 bg-sidebar/80 backdrop-blur-xl hidden md:flex" : "w-64"
        )}>
            <SidebarHeader />

            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <nav className="space-y-1 px-3">
                    <UserProfile count={unreadCount} />

                    {filteredNavItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        const showHeader = item.header && (index === 0 || filteredNavItems[index - 1]?.header !== item.header)

                        return (
                            <div key={item.name}>
                                {showHeader && (
                                    <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {item.header}
                                    </div>
                                )}
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        item.className
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground",
                                            // Handle special styling for Admin Dashboard link in portal
                                            item.name === "Admin Dashboard" && "text-primary"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>

                                {/* Inject Notification Bell after notifications/profile if needed, but doing strictly linearly here */}
                            </div>
                        )
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className={cn(
                "border-t border-sidebar-border p-4 space-y-4",
                variant === "portal" && "bg-sidebar-accent/5"
            )}>
                {variant === "admin" && (
                    <div className="space-y-1 mb-2">
                        <Link
                            href="/portal"
                            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                            <ArrowLeft className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-sidebar-foreground" />
                            Back to App
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-between px-3">
                    {variant !== "portal" && <span className="text-xs font-semibold text-muted-foreground uppercase">Theme</span>}
                    <div className={variant === "portal" ? "ml-auto" : ""}>
                        <ThemeSwitcher />
                    </div>
                </div>

                {/* User Info Footer (Portal Style) */}
                {variant === "portal" && user && (
                    <div className="flex items-center justify-between px-1">
                        <div className="text-xs text-muted-foreground">
                            Signed in as <br />
                            <span className="text-sidebar-foreground font-medium">{user.email}</span>
                        </div>
                    </div>
                )}

                {/* Debug Role */}
                {user && (
                    <div className="px-3 text-xs text-muted-foreground">
                        Role: <span className="font-mono font-bold text-primary">{userRole}</span>
                    </div>
                )}

                {user ? (
                    <form action={logout}>
                        <button type="submit" className={cn(
                            "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                            variant === "portal" && "justify-start" // Different alignment if needed
                        )}>
                            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-destructive" />
                            {variant === "portal" ? "" : "Sign Out"}
                        </button>
                    </form>
                ) : (
                    variant === "portal" && (
                        <Link href="/login">
                            <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                                Sign In
                            </Button>
                        </Link>
                    )
                )}
            </div>
        </aside>
    )
}
