import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user) redirect("/auth/login")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
        }
    })

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AppSidebar user={user} variant="default" className="hidden lg:flex" />
            <main className="flex-1 overflow-y-auto bg-muted/10 flex flex-col relative z-0">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between sticky top-0 z-50">
                    <h1 className="text-xl font-bold text-sidebar-foreground">
                        <span className="text-primary">Real Time</span> Capital
                    </h1>
                    <div className="flex items-center gap-2">
                        {/* We could add NotificationBell here later if needed for admin */}
                        <MobileNav user={user} />
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    <DashboardBreadcrumb />
                    {children}
                </div>
            </main>
        </div>
    )
}
