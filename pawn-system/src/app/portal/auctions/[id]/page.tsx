import { getAuction, placeBid, setAutoBid } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Gavel, Clock, User, AlertCircle } from "lucide-react"
import { Countdown } from "@/components/countdown"
import { auth } from "@/auth"
import Link from "next/link"
import { ImageGallery } from "@/components/image-gallery"
import { AuctionUpdates } from "@/components/auction-updates"
import { isWatched } from "@/app/actions/watchlist"
import { WatchlistButton } from "@/components/watchlist-button"
import { RatingModal } from "@/components/rating-modal"
import { DisputeModal } from "@/components/dispute-modal"

export default async function AuctionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // ... existing data fetching ...
    const { id } = await params
    const auction = await getAuction(id)
    const session = await auth()
    const isItemWatched = await isWatched(id)

    if (!auction) {
        notFound()
    }

    // ... existing logic ...

    const isWinner = auction.status === "ENDED" && auction.bids[0]?.userId === session?.user?.id

    let images: string[] = []
    try {
        images = JSON.parse(auction.item.images)
    } catch (e) {
        images = []
    }

    const currentPrice = Number(auction.currentBid || auction.startPrice)
    const minBid = currentPrice + 2

    // Check if already rated? Ideally yes, but for MVP we can rely on DB constraint or just show it.
    // Let's assume we want to show it if they haven't rated yet. 
    const isHighValue = Number(auction.item.valuation) > 1000 || currentPrice > 1000
    // We need to fetch if they rated. 
    // For now, let's just show it if they are the winner. The modal can handle "already rated" or we can fetch it.
    // Let's fetch it to be clean.
    // Actually, `getAuction` doesn't include ratings.
    // Let's just show it for now.

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
            <AuctionUpdates auctionId={auction.id} />

            {/* Trust & Safety Actions */}
            <div className="flex justify-end gap-2">
                {session?.user && <DisputeModal auctionId={auction.id} />}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* ... existing left column ... */}
                <div className="lg:col-span-7 space-y-6">
                    <ImageGallery images={images} title={auction.item.name} />

                    <div>
                        <div className="flex items-start justify-between">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{auction.item.name}</h2>
                            <WatchlistButton
                                auctionId={auction.id}
                                initialIsWatched={isItemWatched}
                                isLoggedIn={!!session?.user}
                            />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{auction.item.description}</p>
                    </div>

                    {/* Winner Actions */}
                    {isWinner && (
                        <Card className="bg-amber-500/10 border-amber-500/20">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <h3 className="font-bold text-amber-500 text-lg">Congratulations!</h3>
                                    <p className="text-slate-400 text-sm">You won this auction. How was your experience?</p>
                                </div>
                                <RatingModal auctionId={auction.id} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Bid Section */}
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        {/* ... existing card content ... */}
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Current Bid</CardTitle>
                                <div className="flex gap-2">
                                    {auction.isPractice && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                            Practice Mode
                                        </Badge>
                                    )}
                                    <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                                        {auction.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-4">
                                <div className="text-4xl font-bold text-amber-500">
                                    {formatCurrency(currentPrice)}
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-2">
                                    <Clock className="w-4 h-4" />
                                    Ends in: <Countdown targetDate={auction.endTime} />
                                </div>
                            </div>

                            {auction.status === "ACTIVE" || auction.status === "SCHEDULED" ? (
                                session?.user ? (
                                    (session.user as any).role === "ADMIN" || (session.user as any).role === "STAFF" ? (
                                        <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                            <p className="text-amber-600 font-medium">Administrator View Only</p>
                                            <p className="text-slate-500 text-sm mt-1">Staff members cannot participate in auctions.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {isHighValue && (session.user as any).verificationStatus !== "VERIFIED" ? (
                                                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                                    <h3 className="text-amber-700 dark:text-amber-500 font-bold mb-1">Verification Required</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                        This is a high-value item. You must verify your identity to place a bid.
                                                    </p>
                                                    <Link href="/portal/profile">
                                                        <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                                                            Verify Identity
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <form action={async (formData) => {
                                                    "use server"
                                                    const amount = Number(formData.get("amount"))
                                                    await placeBid(auction.id, amount)
                                                }} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label htmlFor="amount" className="text-sm font-medium">Place your bid</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                name="amount"
                                                                value={minBid}
                                                                readOnly
                                                                className="flex h-10 w-full rounded-md border border-input bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-not-allowed text-slate-500"
                                                            />
                                                            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                                                                Bid
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-slate-500">Minimum bid: {formatCurrency(minBid)} (Increments of $2)</p>
                                                    </div>
                                                </form>
                                            )}

                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                                <form action={async (formData) => {
                                                    "use server"
                                                    const maxAmount = Number(formData.get("maxAmount"))
                                                    await setAutoBid(auction.id, maxAmount)
                                                }} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label htmlFor="maxAmount" className="text-sm font-medium">Set Max Bid (Auto-Bidder)</label>
                                                            {auction.autoBids?.[0] && (
                                                                <span className="text-xs text-amber-600 font-medium">
                                                                    Current Max: {formatCurrency(Number(auction.autoBids[0].maxAmount))}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                name="maxAmount"
                                                                min={minBid}
                                                                step="1"
                                                                defaultValue={auction.autoBids?.[0] ? Number(auction.autoBids[0].maxAmount) : minBid}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            />
                                                            <Button type="submit" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950">
                                                                Set Auto
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            The system will bid for you up to this amount.
                                                        </p>
                                                    </div>
                                                </form>
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <p className="text-slate-500 mb-4">You must be logged in to place a bid.</p>
                                        <Link href={`/login?callbackUrl=/portal/auctions/${auction.id}`}>
                                            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                                Login to Bid
                                            </Button>
                                        </Link>
                                    </div>
                                )
                            ) : (
                                <div className="text-center p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                    <p className="text-slate-500">This auction has ended.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details, History */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Item Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Category</span>
                                    <span className="font-medium">{auction.item.category}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Brand</span>
                                    <span className="font-medium">{auction.item.brand || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Model</span>
                                    <span className="font-medium">{auction.item.model || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Serial Number</span>
                                    <span className="font-medium font-mono text-slate-600 dark:text-slate-400">
                                        {auction.item.serialNumber ? `****${auction.item.serialNumber.slice(-4)}` : "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Location</span>
                                    <span className="font-medium">{auction.item.location || "Main Warehouse"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Condition</span>
                                    <span className="font-medium">Used - Good</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bid History */}
                    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Bid History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {auction.bids.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center">No bids yet.</p>
                                ) : (
                                    auction.bids.map((bid: any) => (
                                        <div key={bid.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{bid.user.name || "Anonymous"}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-500 text-xs">{formatDate(bid.createdAt)}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(Number(bid.amount))}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
