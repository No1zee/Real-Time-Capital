
import { auth } from "@/auth"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationBell } from "@/components/notification-bell"
import { TrustScore } from "@/components/trust-score"

import { getUnreadCount } from "@/app/actions/notification"
import { PageAnimation } from "@/components/page-animation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationListener } from "@/components/notification-listener"


export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <SidebarProvider>
            <AppSidebar user={user} variant="portal" trustScore={<TrustScore />} />
            <NotificationListener />

            <main className="flex-1 overflow-y-auto flex flex-col relative z-0 bg-background w-full">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between sticky top-0 z-50">
                    <Link href="/portal/auctions">
                        <h1 className="text-xl font-bold text-sidebar-foreground cursor-pointer">
                            <span className="text-primary">Real Time</span> Capital
                        </h1>
                    </Link>
                    <div className="flex items-center gap-2">
                        <NotificationBell initialCount={user ? await getUnreadCount() : 0} />
                        <MobileNav user={user} unreadCount={user ? await getUnreadCount() : 0} />
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <div className="md:hidden mb-4">
                        <SidebarTrigger />
                    </div>

                    <PageAnimation>
                        {children}
                    </PageAnimation>
                </div>
            </main>
        </SidebarProvider>
    )
}
