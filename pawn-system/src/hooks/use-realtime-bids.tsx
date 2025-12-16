"use client"

import { useEffect, useState } from "react"
import { pusherClient } from "@/lib/pusher"
import { useRouter } from "next/navigation"

interface BidData {
    currentBid: number
    bidCount: number
    lastBidTime: string | null
    lastBidderId: string | null
}

export function useRealtimeBids(auctionId: string, initialData: BidData) {
    const [data, setData] = useState<BidData>(initialData)
    const [isLive, setIsLive] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    useEffect(() => {
        // 1. If Pusher is configured, use WebSockets
        if (pusherClient) {
            const channel = pusherClient.subscribe(`auction-${auctionId}`)
            setIsLive(true)

            channel.bind("new-bid", (newData: BidData) => {
                setData(newData)
                router.refresh() // Soft refresh to update server components safely
            })

            return () => {
                if (pusherClient) {
                    pusherClient.unsubscribe(`auction-${auctionId}`)
                    pusherClient.unbind_all()
                }
            }
        }

        // 2. Fallback: Polling (if no keys)
        // Check every 4 seconds to be polite to the server
        const interval = setInterval(async () => {
            // In a real app, you'd fetch an API route here.
            // For now, next/navigation refresh mimics the "check".
            // But router.refresh() is too heavy to run every 4s arbitrarily.
            // So in fallback mode, we rely on the user refreshing mainly,
            // OR we implement a lightweight lookup. 
            // To keep it simple: we won't auto-poll continuously to avoid blasting the server 
            // without a dedicated API route. 
            // We can rely on router.refresh() if the user triggers actions.
            setIsLive(false)
        }, 5000)

        return () => clearInterval(interval)

    }, [auctionId, router])

    return {
        ...data,
        isLive
    }
}
