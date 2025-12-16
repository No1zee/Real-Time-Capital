"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useAI } from "@/components/ai/ai-provider"
import { proTips } from "./tip-registry"
import { Bot } from "lucide-react"

export function TipProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [seenTips, setSeenTips] = useState<Set<string>>(new Set())
    const { notify } = useAI()

    useEffect(() => {
        // Find tip for current route
        const activeTip = proTips.find(t => {
            if (Array.isArray(t.route)) return t.route.includes(pathname)
            return t.route === pathname
        })

        if (!activeTip) return
        if (seenTips.has(activeTip.id)) return

        const threshold = activeTip.idleThreshold || 5000 // Default 5s (reduced for visibility)

        const timer = setTimeout(() => {
            // Trigger as AI Notification
            notify(activeTip.message, undefined, undefined, "default")

            // Mark as seen
            setSeenTips(prev => new Set(prev).add(activeTip.id))
        }, threshold)

        return () => clearTimeout(timer)
    }, [pathname, seenTips, notify])

    return <>{children}</>
}
