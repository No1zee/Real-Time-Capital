"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleWatchlist, getWatchlistStatus } from "@/app/actions/watchlist"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface WatchlistButtonProps {
    auctionId: string
    initialStatus?: boolean
    className?: string
}

export function WatchlistButton({ auctionId, initialStatus = false, className }: WatchlistButtonProps) {
    const [isWatched, setIsWatched] = useState(initialStatus)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Optimistic update if initialStatus passed, else fetch? 
        // For lists, better pass initialStatus. For details, maybe fetch active.
        // Assuming parent passes active state or we trust initial.
    }, [])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)

        // Optimistic UI
        const previousState = isWatched
        setIsWatched(!isWatched)

        const result = await toggleWatchlist(auctionId)

        if (!result.success) {
            setIsWatched(previousState)
            toast.error(result.message)
        } else {
            toast.success(result.message)
        }
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full hover:bg-white/20 hover:text-red-500 transition-all", isWatched && "text-red-500 fill-current", className)}
            onClick={handleToggle}
            disabled={loading}
        >
            <Heart className={cn("w-5 h-5", isWatched ? "fill-current" : "")} />
            <span className="sr-only">Toggle Watchlist</span>
        </Button>
    )
}
