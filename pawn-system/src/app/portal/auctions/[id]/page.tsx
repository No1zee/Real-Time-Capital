import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { checkBiddingEligibility, placeBid } from "@/app/actions/auctions"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WatchlistButton } from "@/components/auctions/watchlist-button"
import { QuestionSection } from "@/components/auctions/question-section"
import { BuyNowButton } from "@/components/auctions/buy-now-button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import Image from "next/image"
import { Gavel, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    const eligibility = session?.user ? await checkBiddingEligibility() : { eligible: false, requiredDeposit: 50, reason: "NOT_LOGGED_IN" }

    const auction = await db.auction.findUnique({
        where: { id },
        include: {
            Item: true,
            Bid: {
                orderBy: { amount: 'desc' },
                take: 10,
                include: { User: { select: { name: true } } }
            },
            Questions: {
                include: { User: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!auction) notFound()

    const currentPrice = Number(auction.currentBid || auction.startPrice)
    const minBid = currentPrice + 1 // Simple increment rule

    async function handleBid(formData: FormData) {
        "use server"
        const amount = Number(formData.get("amount"))
        if (!amount) return
        await placeBid(id, amount)
    }

    const images = JSON.parse(auction.Item.images)
    const mainImage = images[0] || "/placeholder.svg"
    const item = auction.Item as any

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-6">
            <Link href="/portal/auctions" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Auctions
            </Link>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Images */}
                <div className="space-y-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted">
                        {mainImage !== "/placeholder.svg" ? (
                            <Image
                                src={mainImage}
                                alt={auction.Item.name}
                                fill
                                className="object-cover"
                                unoptimized={mainImage.includes("loremflickr.com")}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                        <Badge className="absolute top-4 left-4 text-lg">
                            {auction.status}
                        </Badge>
                    </div>
                    {/* Thumbnails grid would go here */}
                </div>

                {/* Right: Info & Bidding */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{auction.Item.name}</h1>
                        <p className="text-xl text-primary font-semibold mt-2">
                            Current Price: {formatCurrency(currentPrice)}
                        </p>
                        <div className="flex items-center text-muted-foreground mt-2">
                            <Clock className="h-4 w-4 mr-2" />
                            Time Left: {formatDistanceToNow(auction.endTime, { addSuffix: true })}
                        </div>
                    </div>

                    <Card className={`border-2 ${eligibility.eligible ? "border-primary/10" : "border-yellow-500/20"}`}>
                        <CardHeader className="bg-muted/50 pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <Gavel className="mr-2 h-5 w-5" />
                                    {eligibility.eligible ? "Place a Bid" : session?.user ? "Registration Required" : "Login Required"}
                                </div>
                                {!eligibility.eligible && session?.user && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                                        Deposit Unpaid
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {session?.user?.role === "ADMIN" ? (
                                <div className="text-center space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                                    <div className="flex justify-center">
                                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50">
                                            Administrator View
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        As an administrator, you can view auction details but are restricted from participating in bidding to maintain platform integrity.
                                    </p>
                                </div>
                            ) : eligibility.eligible ? (
                                <div className="space-y-6">
                                    {/* Buy Now Option */}
                                    {Number(auction.buyNowPrice) > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">BUY NOW</span>
                                                    Purchase immediately
                                                </h3>
                                                <span className="text-xl font-bold text-emerald-700">
                                                    {formatCurrency(Number(auction.buyNowPrice))}
                                                </span>
                                            </div>
                                            <p className="text-sm text-emerald-600 mb-4">
                                                Skip the bidding war and secure this item right now.
                                            </p>
                                            <BuyNowButton
                                                auctionId={auction.id}
                                                price={Number(auction.buyNowPrice)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                            />
                                        </div>
                                    )}

                                    {/* Standard Bidding */}
                                    <form action={handleBid} className="space-y-3">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    name="amount"
                                                    min={minBid}
                                                    step="1"
                                                    defaultValue={minBid}
                                                    className="text-lg"
                                                    placeholder="Enter bid amount"
                                                />
                                            </div>
                                            <Button type="submit" size="lg" className="px-8">
                                                Bid Now
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Minimum bid: {formatCurrency(minBid)}
                                        </p>
                                    </form>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or set a max bid</span>
                                        </div>
                                    </div>

                                    {/* Proxy Bidding */}
                                    <form action={async (formData) => {
                                        "use server"
                                        const { placeProxyBid } = await import("@/app/actions/auctions")
                                        const maxAmount = Number(formData.get("maxAmount"))
                                        if (!maxAmount) return
                                        await placeProxyBid(id, maxAmount)
                                    }} className="space-y-3 bg-muted/30 p-4 rounded-lg border border-dashed">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center justify-between">
                                                <span>Proxy Bidding (Auto-Bid)</span>
                                                <Badge variant="outline" className="text-[10px] h-5">NEW</Badge>
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    name="maxAmount"
                                                    min={minBid + 10}
                                                    step="1"
                                                    placeholder="Your max limit"
                                                    className="bg-background"
                                                />
                                                <Button type="submit" variant="secondary">Set Max</Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                System will bid for you up to this amount.
                                            </p>
                                        </div>
                                    </form>

                                    {/* Fee Breakdown Warning */}
                                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-blue-800 dark:text-blue-300">
                                        <strong>Note:</strong> Final payment will include Buyer's Levy ({auction.buyerLevyPercent}%) and VAT ({auction.vatPercent}%).
                                        <br />
                                        Est. Total on Current Bid: {formatCurrency(currentPrice * (1 + (auction.buyerLevyPercent / 100) + (auction.vatPercent / 100)))}
                                    </div>
                                </div>
                            ) : !session?.user ? (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        You must be logged in to participate in this auction.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button asChild variant="outline" size="lg">
                                            <Link href={`/login?callbackUrl=/portal/auctions/${id}`}>Sign In</Link>
                                        </Button>
                                        <Button asChild size="lg">
                                            <Link href="/register">Create Account</Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        To maintain the integrity of our auctions, a refundable security deposit of
                                        <span className="font-semibold text-foreground"> {formatCurrency(eligibility.requiredDeposit || 50)} </span>
                                        is required to place bids.
                                    </p>
                                    <Button asChild size="lg" className="w-full">
                                        <Link href="/portal/auctions/register">Pay Deposit to Unlock Bidding</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Item Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">Category</span>
                                <span className="font-medium">{auction.Item.category}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">Condition</span>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold">{auction.Item.name}</h1>
                                        <p className="text-muted-foreground">{auction.Item.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <WatchlistButton auctionId={auction.id} />
                                        <Badge variant={auction.status === "ACTIVE" ? "default" : "secondary"}>
                                            {auction.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">Description</span>
                                <span>{auction.Item.description}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Recent Bids</h3>
                        <div className="space-y-2">
                            {auction.Bid.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No bids yet. Be the first!</p>
                            ) : (
                                auction.Bid.map((bid) => (
                                    <div key={bid.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                                        <span>{bid.User.name || "Anonymous"}</span>
                                        <div className="flex gap-4">
                                            <span className="font-semibold">
                                                {formatCurrency(Number(bid.amount))}
                                                {auction.vatPercent > 0 && <span className="text-xs font-normal text-muted-foreground ml-1">(+ VAT)</span>}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {formatDistanceToNow(bid.createdAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <QuestionSection
                        auctionId={auction.id}
                        questions={auction.Questions || []}
                        isSellerOrAdmin={session?.user?.role === "ADMIN" || session?.user?.id === item.userId}
                    />
                </div>
            </div>
        </div>
    )
}
