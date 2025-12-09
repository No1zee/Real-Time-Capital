
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
import { AppSidebar } from "@/components/app-sidebar"


export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-amber-500/30">
            <AppSidebar user={user} variant="portal" trustScore={<TrustScore />} />

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
