"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Gavel,
    CreditCard,
    Settings,
    LogOut,
    ArrowLeft,
    Shield,
    Package,
    FileBarChart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { ThemeSwitcher } from "@/components/theme-switcher"

const navigation = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Global Inventory", href: "/admin/inventory", icon: Package },
    { name: "Auctions", href: "/admin/auctions", icon: Gavel },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Reports", href: "/admin/reports", icon: FileBarChart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
                        <Shield className="h-5 w-5" />
                    </div>
                    <span className="font-bold tracking-tight text-sidebar-foreground">Admin Center</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-3 mb-2">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Management
                    </p>
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground text-muted-foreground"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            <div className="border-t border-sidebar-border p-4 bg-sidebar">
                <div className="flex justify-between items-center px-2 mb-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground">Theme</span>
                    <ThemeSwitcher />
                </div>
                <div className="space-y-1">
                    <Link
                        href="/portal"
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-sidebar-foreground" />
                        Back to App
                    </Link>
                    <form action={logout}>
                        <button type="submit" className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-destructive" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
