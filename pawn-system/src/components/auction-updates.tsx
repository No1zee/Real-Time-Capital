"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuctionUpdatesProps {
    auctionId: string
    intervalMs?: number
}

export function AuctionUpdates({ auctionId, intervalMs = 5000 }: AuctionUpdatesProps) {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh()
        }, intervalMs)

        return () => clearInterval(interval)
    }, [router, intervalMs])

    return null
}
