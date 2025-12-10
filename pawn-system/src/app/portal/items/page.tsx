import { getUserItems } from "@/app/actions/item"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Package, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function UserInventoryPage() {
    const items = await getUserItems()

    const getStatusBadge = (status: string, valuationStatus: string | null) => {
        // Valuation Status takes precedence if item is pending
        if (status === "PENDING_VALUATION") {
            if (valuationStatus === "PENDING_MARKET_EVAL")
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> In Review</Badge>
            if (valuationStatus === "PENDING_FINAL_OFFER")
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Initial Offer Ready</Badge>
            if (valuationStatus === "OFFER_ACCEPTED")
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Offer Accepted</Badge>
            if (valuationStatus === "REJECTED")
                return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
        }

        if (status === "ACTIVE_LOAN") return <Badge className="bg-green-600">Active Loan</Badge>
        if (status === "REDEEMED") return <Badge variant="outline" className="border-green-600 text-green-600">Redeemed</Badge>
        if (status === "IN_AUCTION") return <Badge variant="secondary" className="bg-amber-100 text-amber-800">In Auction</Badge>
        if (status === "SOLD") return <Badge variant="secondary">Sold</Badge>

        return <Badge variant="outline">{status}</Badge>
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Items</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track your submitted assets and their valuation status.
                    </p>
                </div>
                <Link href="/portal/pawn">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Pawn New Item
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                    // Image parsing safely
                    let imageUrl = "/placeholder-item.jpg"
                    try {
                        const parsed = JSON.parse(item.images as string)
                        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0]
                    } catch (e) { }

                    return (
                        <Card key={item.id} className="overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-md transition-all">
                            <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 relative group">
                                <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(item.status, item.valuationStatus)}
                                </div>
                            </div>

                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold line-clamp-1" title={item.name}>
                                            {item.name}
                                        </CardTitle>
                                        <CardDescription className="capitalize text-xs">
                                            {item.category.toLowerCase().replace("_", " ")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-2 space-y-4 flex-1 flex flex-col justify-end">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span>Submitted:</span>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 dark:text-slate-400">Estimated Value:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                            {formatCurrency(Number(item.userEstimatedValue || 0))}
                                        </span>
                                    </div>

                                    {(Number(item.valuation) > 0) && (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg flex justify-between items-center mt-2 border border-green-100 dark:border-green-900/30">
                                            <span className="text-green-700 dark:text-green-400 font-medium text-xs">Preliminary Offer</span>
                                            <span className="text-green-700 dark:text-green-400 font-bold">
                                                {formatCurrency(Number(item.valuation))}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link href={`/portal/items/${item.id}`} className="w-full">
                                    <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}

                {items.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                        <Package className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No items found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mb-6">
                            You haven't submitted any items for valuation yet. Start by pawning a new item.
                        </p>
                        <Link href="/portal/pawn">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                Get a Valuation
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
