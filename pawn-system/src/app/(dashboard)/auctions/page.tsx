
import { getAuctions } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, Gavel } from "lucide-react"

export default async function AuctionsPage() {
    const auctions = await getAuctions("STAFF")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Auctions</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage auctions for unredeemed items.</p>
                </div>
                <Link href="/auctions/create">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Auction
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction: any) => (
                    <Card key={auction.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {auction.item.name}
                            </CardTitle>
                            <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                                {auction.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                Current Price
                            </p>

                            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>Start:</span>
                                    <span>{formatDate(auction.startTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>End:</span>
                                    <span>{formatDate(auction.endTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bids:</span>
                                    <span>{auction.bids.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {auctions.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                        <Gavel className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No auctions found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Create a new auction to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
