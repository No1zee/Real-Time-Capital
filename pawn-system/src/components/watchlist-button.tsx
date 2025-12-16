"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleWatchlist } from "@/app/actions/watchlist"
import { useAI } from "./ai/ai-provider"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"



interface WatchlistButtonProps {
    auctionId: string
    initialIsWatched: boolean
    isLoggedIn: boolean
}

export function WatchlistButton({ auctionId, initialIsWatched, isLoggedIn }: WatchlistButtonProps) {
    const [isWatched, setIsWatched] = useState(initialIsWatched)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { notify } = useAI()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()

        if (!isLoggedIn) {
            notify("Login Required to watch items", "Login", () => router.push("/login"), "warning")
            return
        }

        setIsLoading(true)
        // Optimistic update
        const previousState = isWatched
        setIsWatched(!isWatched)

        try {
            const result = await toggleWatchlist(auctionId)
            if (result.success && typeof result.active === 'boolean') {
                setIsWatched(result.active)
                notify(result.message, undefined, undefined, "success")
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            // Revert on error
            setIsWatched(previousState)
            console.error("Failed to toggle watchlist", error)
            notify("Failed to update watchlist", undefined, undefined, "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                isWatched ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-slate-500"
            )}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart className={cn("w-5 h-5", isWatched && "fill-current")} />
            <span className="sr-only">{isWatched ? "Remove from watchlist" : "Add to watchlist"}</span>
        </Button>
    )
}
