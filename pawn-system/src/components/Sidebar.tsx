"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Banknote, Gavel, Package, Settings, LogOut, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { ThemeSwitcher } from "@/components/theme-switcher"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
    { name: "Loans", href: "/loans", icon: Banknote, roles: ["ADMIN", "STAFF"] },
    { name: "My Loans", href: "/portal/loans", icon: Banknote, roles: ["CUSTOMER"] },
    { name: "Inventory", href: "/inventory", icon: Package, roles: ["ADMIN", "STAFF"] },
    { name: "My Inventory", href: "/portal/inventory", icon: Package, roles: ["CUSTOMER"] },
    { name: "Auctions", href: "/auctions", icon: Gavel, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
    { name: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
    { name: "My Wallet", href: "/portal/wallet", icon: Wallet, roles: ["CUSTOMER"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "STAFF", "CUSTOMER"] },
]

interface SidebarProps {
    userRole?: string
}

export function Sidebar({ userRole = "CUSTOMER" }: SidebarProps) {
    const pathname = usePathname()

    const filteredNavigation = navigation.filter(item => item.roles.includes(userRole))

    return (
        <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="font-bold text-primary-foreground text-lg">R</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Real Time Capital</h1>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-sidebar-border p-4 space-y-4">
                <div className="flex items-center justify-between px-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Theme</span>
                    <ThemeSwitcher />
                </div>
                <form action={logout}>
                    <button type="submit" className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-destructive" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
