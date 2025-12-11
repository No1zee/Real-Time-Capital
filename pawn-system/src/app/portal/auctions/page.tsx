import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { checkBiddingEligibility, getActiveAuctions, getEndedAuctions } from "@/app/actions/auctions"
import { AuctionRegistrationCard } from "@/components/auctions/registration-card"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import Image from "next/image"
import { Timer, Gavel } from "lucide-react"
import { ProTipTrigger } from "@/components/tips/pro-tip-trigger"
import { KnowledgeWidget } from "@/components/content/knowledge-widget"

export default async function AuctionsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // 1. Gatekeeper: Check Deposit
    const eligibility = await checkBiddingEligibility()

    // 2. Fetch Auctions (Eligible Users Only)
    const auctions = await getActiveAuctions()
    const endedAuctions = await getEndedAuctions()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Auctions</h1>
                    <p className="text-muted-foreground">Place your bids on premium verified assets.</p>
                </div>
                <div className="flex items-center gap-2">
                    {eligibility.eligible ? (
                        <Badge variant="outline" className="h-8 gap-1 px-3">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Verified Bidder
                        </Badge>
                    ) : (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/portal/auctions/register">Register to Bid</Link>
                        </Button>
                    )}
                </div>
            </div>

            {auctions.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Gavel className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No Active Auctions</h3>
                    <p className="text-muted-foreground">Check back later for new inventory.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {auctions.map((auction) => {
                        const images = JSON.parse(auction.Item.images)
                        const coverImage = images[0] || "/placeholder.png"

                        return (
                            <ProTipTrigger key={auction.id} tipId="auction-listing">
                                <Card className="overflow-hidden flex flex-col hover-subtle group h-full">
                                    <div className="aspect-[4/3] relative bg-muted">
                                        {coverImage !== "/placeholder.png" ? (
                                            <Image src={coverImage} alt={auction.Item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-black/70 backdrop-blur-sm border-none text-white hover:bg-black/70">
                                                {auction.Item.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="space-y-1 p-4">
                                        <CardTitle className="line-clamp-1 text-lg">{auction.Item.name}</CardTitle>
                                        <div className="flex items-center text-sm text-yellow-600 font-medium">
                                            <Timer className="h-4 w-4 mr-1" />
                                            End {formatDistanceToNow(auction.endTime, { addSuffix: true })}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex-1 space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm text-muted-foreground">Current Bid</span>
                                            <span className="text-lg font-bold">
                                                {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>{auction._count.Bid} Bids</span>
                                            <span>Start: {formatCurrency(Number(auction.startPrice))}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button asChild className="w-full">
                                            <Link href={`/portal/auctions/${auction.id}`}>
                                                Place Bid
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </ProTipTrigger>
                        )
                    })}
                </div>
            )}

            {/* Ended Auctions Section */}
            {endedAuctions.length > 0 && (
                <div className="space-y-4 pt-8 border-t">
                    <h2 className="text-2xl font-bold tracking-tight text-muted-foreground">Recent Ended Auctions</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {endedAuctions.map((auction) => {
                            const images = JSON.parse(auction.Item.images)
                            const coverImage = images[0] || "/placeholder.png"

                            return (
                                <Card key={auction.id} className="overflow-hidden flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all">
                                    <div className="aspect-[4/3] relative bg-muted">
                                        {coverImage !== "/placeholder.png" ? (
                                            <Image src={coverImage} alt={auction.Item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Badge variant="secondary" className="text-lg px-4 py-1">ENDED</Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="space-y-1 p-4">
                                        <CardTitle className="line-clamp-1 text-lg">{auction.Item.name}</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            Closed {formatDistanceToNow(auction.endTime, { addSuffix: true })}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex-1 space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm text-muted-foreground">Final Bid</span>
                                            <span className="text-lg font-bold">
                                                {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {auction._count.Bid} Bids Placed
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button variant="secondary" disabled className="w-full">
                                            Auction Closed
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
            <div className="mt-8">
                <KnowledgeWidget category="auctions" title="Bidding Tips" limit={3} />
            </div>
        </div>
    )
}
