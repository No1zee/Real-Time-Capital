import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllItemsAdmin } from "@/app/actions/admin/inventory"
import { MobileAdminHeader } from "@/components/admin/mobile-header"
import { InventoryView } from "@/components/admin/inventory/inventory-view"

export const dynamic = "force-dynamic"

export default async function AdminInventoryPage() {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const items = await getAllItemsAdmin()

    return (
        <div className="p-8 space-y-8">
            <MobileAdminHeader title="Asset Register" backHref="/admin/dashboard" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 id="admin-inventory-title" className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Asset Register</h1>
                    <p className="text-slate-500 mt-1">Manage all assets across the system.</p>
                </div>
            </div>

            <InventoryView items={items} />
        </div>
    )
}
