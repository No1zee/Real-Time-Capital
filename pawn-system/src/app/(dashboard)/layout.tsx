import { Sidebar } from "@/components/Sidebar"
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
        select: { role: true }
    })

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar userRole={user?.role || "CUSTOMER"} />
            <main className="flex-1 overflow-y-auto bg-muted/10 p-8">
                {children}
            </main>
        </div>
    )
}
