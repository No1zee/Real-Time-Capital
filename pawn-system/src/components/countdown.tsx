"use client"

import { useEffect, useState } from "react"

export function Countdown({ targetDate }: { targetDate: Date | string }) {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        const target = new Date(targetDate).getTime()

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const distance = target - now

            if (distance < 0) {
                clearInterval(interval)
                setTimeLeft("EXPIRED")
                return
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    return (
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {timeLeft || "Loading..."}
        </span>
    )
}
