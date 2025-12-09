import { getAuction, placeBid, setAutoBid } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Gavel, Clock, User, AlertCircle, TrendingUp, DollarSign } from "lucide-react"
import { Countdown } from "@/components/countdown"
import { auth } from "@/auth"
import Link from "next/link"
import { ImageGallery } from "@/components/image-gallery"
import { AuctionUpdates } from "@/components/auction-updates"
import { isWatched } from "@/app/actions/watchlist"
import { WatchlistButton } from "@/components/watchlist-button"

export default async function AuctionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    // @ts-ignore - Bypass type mismatch issues with generated client
    const auction: any = await getAuction(id)

    if (!auction) {
        notFound()
    }

    const isUserWatched = session?.user?.id ? await isWatched(auction.id) : false

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Gallery */}
                <div className="w-full md:w-1/2">
                    {/* @ts-ignore */}
                    <ImageGallery images={auction.item.images} title={auction.item.name} />
                </div>

                {/* Auction Details & Bidding */}
                <div className="w-full md:w-1/2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{auction.item.name}</h1>
                        <p className="text-muted-foreground mt-2">{auction.item.description}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Badge variant={auction.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                            {auction.status}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            <Countdown targetDate={auction.endTime} />
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end border-b pb-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Market Valuation</p>
                                    <p className="text-lg font-semibold">
                                        {formatCurrency(Number(auction.item.valuation))}
                                    </p>
                                </div>
                            </div>

                            {session?.user ? (
                                <form action={async (formData) => {
                                    "use server"
                                    const amount = Number(formData.get("amount"))
                                    await placeBid(auction.id, amount)
                                }} className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                name="amount"
                                                placeholder={`Min bid: ${formatCurrency(Number(auction.currentBid || auction.startPrice) + 2)}`}
                                                className="pl-9"
                                                min={Number(auction.currentBid || auction.startPrice) + 2}
                                                step={2}
                                                required
                                            />
                                        </div>
                                        <Button type="submit">Place Bid</Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Minimum bid increment: {formatCurrency(2)}
                                    </p>
                                </form>
                            ) : (
                                <div className="bg-muted p-4 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Login to place a bid</p>
                                    <Button asChild variant="secondary">
                                        <Link href={`/login?callbackUrl=/portal/auctions/${id}`}>Login</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Watchlist Button */}
                            <div className="flex justify-end pt-2">
                                {/* @ts-ignore */}
                                <WatchlistButton auctionId={auction.id} initialIsWatched={isUserWatched} isLoggedIn={!!session?.user} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Auto Bid Section */}
                    {session?.user && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <TrendingUp className="mr-2 h-4 w-4" /> Auto-Bidding
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={async (formData) => {
                                    "use server"
                                    const maxAmount = Number(formData.get("maxAmount"))
                                    await setAutoBid(auction.id, maxAmount)
                                }} className="flex gap-2">
                                    <Input
                                        type="number"
                                        name="maxAmount"
                                        placeholder="Max limit"
                                        className="h-8 text-sm"
                                        min={Number(auction.currentBid || auction.startPrice)}
                                    />
                                    <Button size="sm" variant="outline">Set</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Auction Updates / History */}
            <div className="mt-12">
                <h3 className="text-xl font-bold mb-4">Auction History</h3>
                {/* @ts-ignore */}
                <AuctionUpdates auctionId={auction.id} initialBids={auction.bids} />
            </div>
        </div>
    )
}
