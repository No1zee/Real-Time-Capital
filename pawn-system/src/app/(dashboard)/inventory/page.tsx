import { db } from "@/lib/db"
import { Package, Tag, DollarSign, Calendar } from "lucide-react"
import { InventoryActions } from "@/components/InventoryActions"
import { BarcodeLabel } from "@/components/barcode-label"

export default async function InventoryPage() {
    const items = await db.item.findMany({
        where: {
            status: {
                in: ["FOR_SALE", "SOLD"],
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
        include: {
            loan: {
                include: {
                    customer: true,
                },
            },
        },
    })

    const totalInventoryValue = items
        .filter(i => i.status === "FOR_SALE")
        .reduce((sum, item) => sum + Number(item.valuation), 0)

    const totalSales = items
        .filter(i => i.status === "SOLD")
        .reduce((sum, item) => sum + (Number(item.salePrice) || 0), 0)

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-muted-foreground">Manage items for sale and view sales history.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Items For Sale</div>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{items.filter(i => i.status === "FOR_SALE").length}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Inventory Value</div>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No items in inventory.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Item</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Category</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Valuation</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Sale Price</th>
                                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-2 align-middle">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.serialNumber}</div>
                                            </td>
                                            <td className="p-2 align-middle">{item.category}</td>
                                            <td className="p-2 align-middle">${Number(item.valuation).toFixed(2)}</td>
                                            <td className="p-2 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${item.status === "FOR_SALE"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                    : "border-green-200 bg-green-50 text-green-700"
                                                    }`}>
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-2 align-middle font-medium">
                                                {item.salePrice ? `$${Number(item.salePrice).toFixed(2)}` : "-"}
                                            </td>
                                            <td className="p-2 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <BarcodeLabel item={item} />
                                                    <InventoryActions
                                                        item={{
                                                            id: item.id,
                                                            name: item.name,
                                                            valuation: Number(item.valuation),
                                                            status: item.status
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
