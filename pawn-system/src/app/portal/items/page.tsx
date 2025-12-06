
import { getCustomerItems } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"

export default async function PortalItemsPage() {
    const items = await getCustomerItems()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Items</h2>
                <p className="text-slate-500 dark:text-slate-400">Items currently held as collateral.</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">You have no items in pawn.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {item.name}
                                </CardTitle>
                                <Package className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {formatCurrency(Number(item.valuation))}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Valuation</p>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">{item.category}</Badge>
                                    {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                                    <Badge variant={item.status === "IN_PAWN" ? "default" : "secondary"}>
                                        {item.status}
                                    </Badge>
                                </div>

                                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                    {item.description}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
