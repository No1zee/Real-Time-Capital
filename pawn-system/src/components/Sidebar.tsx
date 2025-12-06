"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Banknote, Gavel, Package, Settings, LogOut, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Loans", href: "/loans", icon: Banknote },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Auctions", href: "/auctions", icon: Gavel },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-primary text-primary-foreground border-r border-primary-foreground/10">
            <div className="flex h-16 items-center px-6 border-b border-primary-foreground/10">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                        <span className="font-bold text-accent-foreground text-lg">R</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Real Time Capital</h1>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-accent text-accent-foreground shadow-md"
                                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-accent-foreground" : "text-primary-foreground/50 group-hover:text-primary-foreground"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-primary-foreground/10 p-4">
                <form action={logout}>
                    <button type="submit" className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/70 hover:bg-destructive/20 hover:text-destructive-foreground transition-colors">
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-primary-foreground/50 group-hover:text-destructive-foreground" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
