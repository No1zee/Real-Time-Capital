
import { getAuctions } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { LayoutGrid, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AuctionArchivePage() {
    const auctions = await getAuctions("CUSTOMER", undefined, true) // role, filters, includeArchived=true

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Auction Archive</h2>
                    <p className="text-slate-500 dark:text-slate-400">Browse past auctions and sold items.</p>
                </div>
                <Link href="/portal/auctions" className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Active Auctions
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction: any) => {
                    let imageUrl = "https://placehold.co/600x400?text=No+Image"
                    try {
                        const rawImages = auction.item.images
                        let images: string[] = []

                        if (typeof rawImages === 'string') {
                            images = JSON.parse(rawImages)
                        } else if (Array.isArray(rawImages)) {
                            images = rawImages
                        }

                        if (Array.isArray(images) && images.length > 0) {
                            imageUrl = images[0]
                        }
                    } catch (e) {
                        // Silent fail
                    }

                    return (
                        <Card key={auction.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {auction.item.name}
                                </CardTitle>
                                <Badge variant="secondary">
                                    {auction.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg grayscale hover:grayscale-0 transition-all">
                                    <img
                                        src={imageUrl}
                                        alt={auction.item.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                                        Ended: {formatDate(auction.endTime)}
                                    </div>
                                </div>
                                <div className="p-6 pt-4">
                                    <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                        Final Price
                                    </p>

                                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Bids:</span>
                                            <span>{auction._count.bids}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {auctions.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <LayoutGrid className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No archived auctions</h3>
                    </div>
                )}
            </div>
        </div>
    )
}
