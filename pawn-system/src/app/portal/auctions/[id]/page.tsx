import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { checkBiddingEligibility, placeBid } from "@/app/actions/auctions"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import Image from "next/image"
import { Gavel, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Check eligibility logic here (or pass to client? server simpler)
    const eligibility = await checkBiddingEligibility()

    const auction = await db.auction.findUnique({
        where: { id },
        include: {
            Item: true,
            Bid: {
                orderBy: { amount: 'desc' },
                take: 10,
                include: { User: { select: { name: true } } }
            }
        }
    })

    if (!auction) notFound()

    const currentPrice = Number(auction.currentBid || auction.startPrice)
    const minBid = currentPrice + 1 // Simple increment rule
    const isOwner = session.user.id === auction.Item.userId // Unlikely for pawned item but possible

    async function handleBid(formData: FormData) {
        "use server"
        const amount = Number(formData.get("amount"))
        if (!amount) return
        await placeBid(id, amount)
    }

    const images = JSON.parse(auction.Item.images)
    const mainImage = images[0] || "/placeholder.png"
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
                        {mainImage !== "/placeholder.png" ? (
                            <Image src={mainImage} alt={auction.Item.name} fill className="object-cover" />
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
                                    {eligibility.eligible ? "Place a Bid" : "Registration Required"}
                                </div>
                                {!eligibility.eligible && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                                        Deposit Unpaid
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {eligibility.eligible ? (
                                <form action={handleBid} className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            name="amount"
                                            min={minBid}
                                            step="1"
                                            defaultValue={minBid}
                                            className="text-lg"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Minimum bid: {formatCurrency(minBid)}
                                        </p>
                                    </div>
                                    <Button type="submit" size="lg" className="px-8">
                                        Bid Now
                                    </Button>
                                </form>
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
                                <span className="font-medium">{item.condition}</span>
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
                                            <span className="text-muted-foreground">
                                                {formatDistanceToNow(bid.createdAt, { addSuffix: true })}
                                            </span>
                                            <span className="font-bold">{formatCurrency(Number(bid.amount))}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
