"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

interface AuctionTimerProps {
    endTime: Date | string
}

export function AuctionTimer({ endTime }: AuctionTimerProps) {
    const [timeLeft, setTimeLeft] = useState("")
    const [isUrgent, setIsUrgent] = useState(false)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime()
            const now = new Date().getTime()
            const difference = end - now

            if (difference <= 0) {
                setTimeLeft("Ended")
                return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            // Formatting with leading zeros
            const h = hours.toString().padStart(2, "0")
            const m = minutes.toString().padStart(2, "0")
            const s = seconds.toString().padStart(2, "0")

            if (days > 0) {
                setTimeLeft(`${days}d ${h}h ${m}m`)
                setIsUrgent(false)
            } else {
                setTimeLeft(`${h}:${m}:${s}`)
                // Use urgent styling (e.g., red/pulse) if less than 1 hour
                setIsUrgent(hours < 1)
            }
        }

        // Initial call
        calculateTimeLeft()

        // Update every second
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [endTime])

    return (
        <div className={`flex items-center text-sm font-medium font-mono ${isUrgent ? "text-red-500 animate-pulse" : "text-yellow-600"}`}>
            <Timer className="h-4 w-4 mr-1" />
            {timeLeft}
        </div>
    )
}
