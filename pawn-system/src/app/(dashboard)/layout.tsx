import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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
            <AppSidebar user={user} variant="default" className="hidden md:flex" />
            <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
