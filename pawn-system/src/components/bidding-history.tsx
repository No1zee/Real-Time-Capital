"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Bid {
    id: string
    amount: number | string
    createdAt: Date
    auction: {
        id: string
        status: string
        currentBid: number | string | null
        endTime: Date
        item: {
            name: string
            images: string | any
        }
    }
}

export function BiddingHistory({ bids, currentUserId }: { bids: any[], currentUserId?: string }) {
    return (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle>Bidding History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item</th>
                                <th scope="col" className="px-6 py-3">Your Bid</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Auction Status</th>
                                <th scope="col" className="px-6 py-3">Result</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bids.length === 0 ? (
                                <tr className="bg-white dark:bg-slate-950 border-b dark:border-slate-800">
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        No bids placed yet.
                                    </td>
                                </tr>
                            ) : (
                                bids.map((bid) => {
                                    const currentPrice = Number(bid.auction.currentBid || 0)
                                    const myBidAmount = Number(bid.amount)
                                    const isWinning = myBidAmount >= currentPrice && bid.auction.status === "ACTIVE"

                                    // Check if auction is ended and I am the owner of the item (ownership transferred on win)
                                    const isEnded = bid.auction.status === "ENDED" || bid.auction.status === "SOLD"
                                    const isWon = isEnded && bid.auction.Item?.userId === currentUserId
                                    const isLost = isEnded && !isWon

                                    let resultBadge = <Badge variant="secondary">Pending</Badge>

                                    if (bid.auction.status === "ACTIVE") {
                                        if (isWinning) resultBadge = <Badge className="bg-green-500 hover:bg-green-600">Winning</Badge>
                                        else resultBadge = <Badge variant="destructive">Outbid</Badge>
                                    } else if (isEnded) {
                                        if (isWon) resultBadge = <Badge className="bg-green-600 hover:bg-green-700 font-bold">WON 🎉</Badge>
                                        else resultBadge = <Badge variant="outline" className="text-slate-500">Lost</Badge>
                                    }

                                    return (
                                        <tr key={bid.id} className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {bid.auction.item.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatCurrency(myBidAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatDate(bid.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline">{bid.auction.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {resultBadge}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/portal/auctions/${bid.auction.id}`} className="text-amber-600 hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
