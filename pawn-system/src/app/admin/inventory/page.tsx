import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllItemsAdmin, markItemDefaulted, moveItemToAuction } from "@/app/actions/admin/inventory"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, Gavel, AlertTriangle, Package, Printer } from "lucide-react"

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Asset Register</h1>
                    <p className="text-slate-500 mt-1">Manage all assets across the system.</p>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Items</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="search"
                                placeholder="Search by name or serial..."
                                className="pl-9 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Valuation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Loan Info</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                                                <Package className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(Number(item.valuation))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.Loan ? (
                                            <div className="text-sm">
                                                <p className="text-slate-900 dark:text-white">Loan #{item.Loan.id.slice(0, 8)}</p>
                                                <Badge variant={item.Loan.status === "ACTIVE" ? "default" : "secondary"} className="mt-1">
                                                    {item.Loan.status}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">No active loan</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Action: Default Loan */}
                                            {item.Loan?.status === "ACTIVE" && (
                                                <form action={async () => {
                                                    "use server"
                                                    await markItemDefaulted(item.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" title="Mark Loan as Defaulted">
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </form>
                                            )}

                                            {/* Action: Move to Auction */}
                                            {item.status !== "IN_AUCTION" && item.status !== "SOLD" && (
                                                <form action={async () => {
                                                    "use server"
                                                    await moveItemToAuction(item.id)
                                                }}>
                                                    {/* Only allow if owned (no loan) OR loan defaulted */}
                                                    {(!item.loanId || item.Loan?.status === "DEFAULTED") && (
                                                        <Button variant="ghost" size="icon" title="Move to Auction">
                                                            <Gavel className="h-4 w-4 text-amber-500" />
                                                        </Button>
                                                    )}
                                                </form>
                                            )}
                                            {/* Action: Print Label (Placeholder) */}
                                            <Button variant="ghost" size="icon" title="Print Barcode (Coming Soon)" disabled>
                                                <Printer className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
