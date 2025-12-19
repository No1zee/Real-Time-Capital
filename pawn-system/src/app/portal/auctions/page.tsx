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
import { Gavel } from "lucide-react"
import { ProTipTrigger } from "@/components/tips/pro-tip-trigger"
import { KnowledgeWidget } from "@/components/content/knowledge-widget"
import { AuctionTimer } from "@/components/auctions/auction-timer"
import { EmptyState } from "@/components/ui/empty-state"
import { ActiveAuctionCard } from "@/components/auctions/active-auction-card"

import { FilterTabs } from "@/components/auctions/filter-tabs"

export default async function AuctionsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const session = await auth()
    const params = await searchParams
    const category = params.category || "ALL"

    // 1. Gatekeeper: Check Deposit
    const eligibility = await checkBiddingEligibility()

    // 2. Fetch Auctions (Eligible Users Only)
    const rawAuctions = await getActiveAuctions(category)
    // Serialize Decimals for Client Component
    const auctions = rawAuctions.map(a => ({
        ...a,
        startPrice: a.startPrice.toNumber(),
        currentBid: a.currentBid?.toNumber() || null,
    }))
    const endedAuctions = await getEndedAuctions()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 id="auctions-title" className="text-3xl font-bold tracking-tight">Live Auctions</h1>
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
                            <Link href={session?.user ? "/portal/auctions/register" : "/login?callbackUrl=/portal/auctions/register"}>
                                {session?.user ? "Register to Bid" : "Login to Bid"}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <FilterTabs />

            {auctions.length === 0 ? (
                <EmptyState
                    icon={Gavel}
                    title="No Active Auctions"
                    description="Check back later for new premium assets. Our inventory is constantly updated."
                    actionLabel="View Ended Auctions"
                    actionHref="/portal/auctions?view=ended"
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {auctions.map((auction) => (
                        <ProTipTrigger key={auction.id} tipId="auction-listing">
                            <ActiveAuctionCard auction={auction} />
                        </ProTipTrigger>
                    ))}
                </div>
            )}

            {/* Ended Auctions Section */}
            {endedAuctions.length > 0 && (
                <div className="space-y-4 pt-8 border-t">
                    <h2 className="text-2xl font-bold tracking-tight text-muted-foreground">Recent Ended Auctions</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {endedAuctions.map((auction) => {
                            const images = JSON.parse(auction.Item.images)
                            const coverImage = images[0] || "/placeholder.svg"

                            return (
                                <Card key={auction.id} className="overflow-hidden flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all">
                                    <div className="aspect-[4/3] relative bg-muted">
                                        {coverImage !== "/placeholder.svg" ? (
                                            <Image
                                                src={coverImage}
                                                alt={auction.Item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={coverImage.includes("loremflickr.com")}
                                            />
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
