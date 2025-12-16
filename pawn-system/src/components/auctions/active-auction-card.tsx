"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import { AuctionTimer } from "@/components/auctions/auction-timer"
import { useRealtimeBids } from "@/hooks/use-realtime-bids"
import { cn } from "@/lib/utils"
// import { ProTipTrigger } from "@/components/tips/pro-tip-trigger" // Can't easily import server components in client

interface ActiveAuctionCardProps {
    auction: any // detailed type would be better but keeping it flexible for now
}

export function ActiveAuctionCard({ auction }: ActiveAuctionCardProps) {
    const images = JSON.parse(auction.Item.images)
    const coverImage = images[0] || "/placeholder.svg"

    const initialData = useMemo(() => ({
        currentBid: Number(auction.currentBid || auction.startPrice),
        bidCount: auction._count.Bid,
        lastBidTime: null,
        lastBidderId: null
    }), [auction.currentBid, auction.startPrice, auction._count.Bid])

    const { currentBid, bidCount, isLive } = useRealtimeBids(auction.id, initialData)

    return (
        <Card className="overflow-hidden flex flex-col hover-subtle group h-full relative">
            {isLive && (
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[10px] font-medium text-white uppercase tracking-wider">LIVE</span>
                </div>
            )}

            <div className="aspect-[4/3] relative bg-muted group-hover:opacity-90 transition-opacity">
                <Link href={`/portal/auctions/${auction.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {auction.Item.name}</span>
                </Link>
                {coverImage !== "/placeholder.svg" ? (
                    <Image src={coverImage} alt={auction.Item.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
                <div className="absolute top-2 right-2 z-20">
                    <Badge className="bg-black/70 backdrop-blur-sm border-none text-white hover:bg-black/70">
                        {auction.Item.category}
                    </Badge>
                </div>
            </div>
            <CardHeader className="space-y-1 p-4">
                <CardTitle className="line-clamp-1 text-lg">{auction.Item.name}</CardTitle>
                <AuctionTimer endTime={auction.endTime} />
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 space-y-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Current Bid</span>
                    <span className="text-lg font-bold transition-all duration-300 key={currentBid}">
                        {formatCurrency(currentBid)}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{bidCount} Bids</span>
                    <span>Start: {formatCurrency(Number(auction.startPrice))}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/portal/auctions/${auction.id}`}>
                        View Auction
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
