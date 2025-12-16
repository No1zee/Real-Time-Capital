"use client"

import { useRef } from "react"
import { useAI } from "@/components/ai/ai-provider"
import { proTips } from "./tip-registry"
import { Bot, Sparkles } from "lucide-react"

interface ProTipTriggerProps {
    tipId: string
    children: React.ReactNode
    className?: string
}

export function ProTipTrigger({ tipId, children, className }: ProTipTriggerProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const { notify } = useAI()

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => {
            const tip = proTips.find(t => t.id === tipId)
            if (!tip) return

            // Trigger as AI Notification (Default variant matches "Tip" semantics best unless otherwise specified)
            notify(tip.message, "Learn More", undefined, "default", `tip-${tipId}`) // Stable ID prevents flashing on re-hover

        }, 800) // Reduced delay slightly to feels responsive but not accidental (0.8s)
    }

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        // Optional: Dismiss on leave? No, letting it linger for 4s allows reading.
        // If we dismiss immediately, it might be annoying if they slip off the card.
    }

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {children}
        </div>
    )
}
