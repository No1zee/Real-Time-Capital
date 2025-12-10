
import { getAuctions } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Gavel } from "lucide-react"
import { Countdown } from "@/components/countdown"
import { SearchFilters } from "@/components/search-filters"

import { auth } from "@/auth"
import { getWatchlist } from "@/app/actions/watchlist"
import { WatchlistButton } from "@/components/watchlist-button"

export const dynamic = "force-dynamic"

export default async function CustomerAuctionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const session = await auth()
    const params = await searchParams

    const filters = {
        query: params.query,
        category: params.category,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        sort: params.sort,
    }

    const auctions = await getAuctions("CUSTOMER", filters)
    const watchlist = await getWatchlist()
    const watchedIds = new Set(watchlist.map((a: any) => a.id))

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Active Auctions</h2>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Bid on items in real-time.</p>
                </div>
                <Link href="/portal/auctions/archive">
                    <Button variant="outline" className="gap-2 text-sm md:text-base h-9 md:h-10">
                        View Past Auctions
                    </Button>
                </Link>
            </div>

            <SearchFilters />

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction: any) => {
                    let imageUrl = "https://placehold.co/600x400?text=No+Image"
                    try {
                        const rawImages = auction.Item.images
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
                        console.error("Error parsing images for item:", auction.Item.name, e)
                    }

                    return (
                        <Card key={auction.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {auction.Item.name}
                                </CardTitle>
                                <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                                    {auction.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="relative h-40 md:h-48 w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={imageUrl}
                                        alt={auction.Item.name}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 z-10">
                                        <WatchlistButton
                                            auctionId={auction.id}
                                            initialIsWatched={watchedIds.has(auction.id)}
                                            isLoggedIn={!!session?.user}
                                        />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                                        <Countdown targetDate={auction.endTime} />
                                    </div>
                                </div>
                                <div className="p-4 md:p-6 pt-3 md:pt-4">
                                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
                                        Current Price
                                    </p>

                                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-3 md:mb-4">
                                        <div className="flex justify-between">
                                            <span>Ends:</span>
                                            <span>{formatDate(auction.endTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Bids:</span>
                                            <span>{auction._count.Bid}</span>
                                        </div>
                                    </div>

                                    <Link href={`/portal/auctions/${auction.id}`}>
                                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm md:text-base h-9 md:h-10">
                                            View Auction
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {auctions.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                        <Gavel className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No active auctions</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Check back later for new items.</p>
                    </div>
                )}
            </div>

            {/* Recently Ended Section */}
            <div className="pt-6 md:pt-10 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Recently Ended</h2>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Auctions that have closed recently.</p>
                    </div>
                    <Link href="/portal/auctions/archive">
                        <Button variant="ghost" className="hidden md:flex">View All Past Auctions</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
                    {(await getAuctions("CUSTOMER", { ...filters, sort: "endTime_desc" }, true)).slice(0, 4).map((auction: any) => {
                        let imageUrl = "https://placehold.co/600x400?text=No+Image"
                        try {
                            const rawImages = auction.Item.images
                            let images: string[] = []
                            if (typeof rawImages === 'string') {
                                images = JSON.parse(rawImages)
                            } else if (Array.isArray(rawImages)) {
                                images = rawImages
                            }
                            if (Array.isArray(images) && images.length > 0) imageUrl = images[0]
                        } catch (e) { }

                        return (
                            <Link href={`/portal/auctions/${auction.id}`} key={auction.id} className="block group">
                                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-full overflow-hidden hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-600 transition-all">
                                    <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                        <img src={imageUrl} alt={auction.Item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-black/60 text-white px-3 py-1 rounded text-sm font-medium border border-white/20">ENDED</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium truncate" title={auction.Item.name}>{auction.Item.name}</h3>
                                        <div className="flex justify-between items-center mt-2 text-sm">
                                            <span className="text-slate-500">Sold for:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(Number(auction.currentBid || auction.startPrice))}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Ends: {formatDate(auction.endTime)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>

                <div className="mt-6 md:hidden">
                    <Link href="/portal/auctions/archive" className="w-full block">
                        <Button variant="outline" className="w-full">View All Past Auctions</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
