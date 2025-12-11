"use client"

import { useRef } from "react"
import { toast } from "sonner"
import { proTips } from "./tip-registry"
import { Bot, Sparkles } from "lucide-react"

interface ProTipTriggerProps {
    tipId: string
    children: React.ReactNode
    className?: string
}

export function ProTipTrigger({ tipId, children, className }: ProTipTriggerProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => {
            const tip = proTips.find(t => t.id === tipId)
            if (!tip) return

            // Trigger "Mini" Toast (Tooltip Style)
            toast.custom((t) => (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 text-slate-100 shadow-xl border border-white/10 backdrop-blur-md max-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-amber-500/20 text-amber-500">
                            {tip.icon ? <tip.icon className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                            {tip.title}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {tip.message}
                    </p>
                </div>
            ), {
                duration: 4000,
                position: "bottom-right",
                id: `tip-${tipId}` // Prevent duplicates
            })
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
