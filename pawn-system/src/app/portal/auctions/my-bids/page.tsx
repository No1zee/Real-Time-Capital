import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { WonAuctionCard } from "@/components/auctions/won-auction-card"

export default async function MyBidsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // 1. Fetch Active Bids (Auctions still running where user bid)
    // We get the Auction via the Bid. Distinct auctions.
    const activeBids = await db.bid.findMany({
        where: {
            userId: session.user.id,
            Auction: {
                status: "ACTIVE",
                endTime: { gt: new Date() }
            }
        },
        include: {
            Auction: {
                include: { Item: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['auctionId']
    })

    // 2. Fetch Won Auctions (Ended, User is highest bidder)
    // Complex query: Find Auctions where status is ENDED, and the specific user is the highest bidder.
    // Easier: Find ended auctions where user has a bid, then check if they won.
    // Optimization: Store 'winnerId' on Auction when it ends (future refactor).
    // For now: Fetch all ended auctions where user bid, then filter in code.
    const endedAuctionsWithUserBids = await db.auction.findMany({
        where: {
            status: "ENDED",
            Bid: { some: { userId: session.user.id } }
        },
        include: {
            Item: true,
            Bid: {
                orderBy: { amount: 'desc' },
                take: 1
            }
        }
    })

    const wonAuctions = endedAuctionsWithUserBids.filter(auction => {
        const winningBid = auction.Bid[0]
        return winningBid && winningBid.userId === session.user.id
    })

    // Calculate totals for payment (Mock)
    // In real app, check if already paid (Item.status === SOLD?)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Bids & Wins</h1>

            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Bids ({activeBids.length})</TabsTrigger>
                    <TabsTrigger value="won">Won Auctions ({wonAuctions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 mt-4">
                    {activeBids.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                You have no active bids. <Link href="/portal/auctions" className="text-primary underline">Browse Auctions</Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeBids.map((bid) => (
                                <Card key={bid.auctionId}>
                                    <CardHeader className="pb-2">
                                        <Badge variant="outline" className="w-fit mb-2">Active</Badge>
                                        <CardTitle className="line-clamp-1">{bid.Auction.Item.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Current Price</span>
                                                <span className="font-bold">{formatCurrency(Number(bid.Auction.currentBid))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Your Max Bid</span>
                                                <span>{formatCurrency(Number(bid.amount))}</span>
                                                {/* Note: This shows their LATEST bid amount, not necessarily their 'AutoBid' max. */}
                                            </div>
                                            <div className="flex items-center text-muted-foreground pt-2">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Ends {formatDistanceToNow(bid.Auction.endTime, { addSuffix: true })}
                                            </div>
                                            <Button asChild className="w-full mt-2" variant="secondary">
                                                <Link href={`/portal/auctions/${bid.auctionId}`}>View Auction</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="won" className="space-y-4 mt-4">
                    {wonAuctions.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                You haven't won any auctions yet. Keep bidding!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {wonAuctions.map((auction) => (
                                <WonAuctionCard key={auction.id} auction={auction} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
