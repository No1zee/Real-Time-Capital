import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user as any

    console.log("Admin Layout User:", user?.email, user?.role)

    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
        console.log("Redirecting to /portal from AdminLayout")
        redirect("/portal")
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <AppSidebar user={user} variant="admin" />
            <main className="flex-1 overflow-y-auto">
                <div className="h-full bg-slate-50 dark:bg-slate-950">
                    {children}
                </div>
            </main>
        </div>
    )
}
