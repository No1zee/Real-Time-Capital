import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ActiveAuctionCard } from "@/components/auctions/active-auction-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function WatchlistPage() {
    const session = await auth()
    if (!session?.user?.id) return <div>Please log in to view your watchlist.</div>

    const watchlistItems = await db.watchlist.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            Auction: {
                include: {
                    Item: true,
                    _count: {
                        select: { Bid: true }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
                <Button asChild variant="outline">
                    <Link href="/portal/auctions">Browse Auctions</Link>
                </Button>
            </div>

            {watchlistItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <h3 className="text-lg font-semibold">Your watchlist is empty</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Keep track of auctions you're interested in by tapping the heart icon.
                    </p>
                    <Button asChild>
                        <Link href="/portal/auctions">Find Auctions</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {watchlistItems.map((item) => (
                        <ActiveAuctionCard key={item.auctionId} auction={item.Auction} />
                    ))}
                </div>
            )}
        </div>
    )
}
