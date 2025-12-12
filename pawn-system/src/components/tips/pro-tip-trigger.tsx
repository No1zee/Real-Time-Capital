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

            // Trigger "Mini" Toast (Tooltip Style) with Premium Glass Look
            toast.custom((t) => (
                <div className="relative overflow-hidden flex flex-col gap-2 p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl bg-slate-950/70 border border-white/10 max-w-[300px] animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-300 ring-1 ring-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out">
                    {/* Gradient Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-md" />

                    <div className="relative flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 ring-1 ring-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                            {tip.icon ? <tip.icon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                            {tip.title}
                        </span>
                    </div>
                    <p className="relative text-xs text-slate-300 leading-relaxed font-medium pl-1">
                        {tip.message}
                    </p>
                </div>
            ), {
                duration: 5000, // Slightly longer reading time
                position: "bottom-right",
                id: `tip-${tipId}`
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
