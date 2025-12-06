"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleWatchlist } from "@/app/actions/watchlist"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


interface WatchlistButtonProps {
    auctionId: string
    initialIsWatched: boolean
    isLoggedIn: boolean
}

export function WatchlistButton({ auctionId, initialIsWatched, isLoggedIn }: WatchlistButtonProps) {
    const [isWatched, setIsWatched] = useState(initialIsWatched)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()

        if (!isLoggedIn) {
            toast("Login Required", {
                description: "Please login to watch items.",
                action: {
                    label: "Login",
                    onClick: () => router.push("/login")
                },
            })
            return
        }

        setIsLoading(true)
        // Optimistic update
        const previousState = isWatched
        setIsWatched(!isWatched)

        try {
            const result = await toggleWatchlist(auctionId)
            setIsWatched(result.isWatched)
        } catch (error) {
            // Revert on error
            setIsWatched(previousState)
            console.error("Failed to toggle watchlist", error)
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
