import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllValuationsAdmin } from "@/app/actions/admin/valuations"
import { MobileAdminHeader } from "@/components/admin/mobile-header"
import { ValuationView } from "@/components/admin/valuations/valuation-view"
import { Badge } from "@/components/ui/badge"

export default async function AdminValuationsPage() {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const rawItems = await getAllValuationsAdmin()

    // Serialize Decimal fields to numbers/strings for Client Component
    const items = rawItems.map(item => ({
        ...item,
        valuation: item.valuation ? Number(item.valuation) : 0,
        userEstimatedValue: item.userEstimatedValue ? Number(item.userEstimatedValue) : null,
        marketValue: item.marketValue ? Number(item.marketValue) : null,
        finalValuation: item.finalValuation ? Number(item.finalValuation) : null,
        salePrice: item.salePrice ? Number(item.salePrice) : null,
    }))

    const pendingCount = items.filter(i => i.status === "PENDING_VALUATION" || i.valuationStatus === "PENDING").length

    return (
        <div className="p-8 space-y-8">
            <MobileAdminHeader title="Valuations" backHref="/admin/dashboard" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 id="admin-valuations-title" className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Valuations</h1>
                    <p className="text-muted-foreground mt-1">Review and assess customer item submissions.</p>
                </div>
                {pendingCount > 0 && (
                    <Badge variant="secondary" className="px-4 py-1">
                        {pendingCount} Pending
                    </Badge>
                )}
            </div>

            <ValuationView items={items} />
        </div>
    )
}
