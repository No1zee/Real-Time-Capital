"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { proTips } from "./tip-registry"
import { Bot } from "lucide-react"

export function TipProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [seenTips, setSeenTips] = useState<Set<string>>(new Set())

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
            // Trigger Toast
            toast.custom((t) => (
                <div className="flex items-start gap-4 w-full p-4 rounded-xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div className="bg-primary/10 p-2 rounded-full mt-1 shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pro Tip</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{activeTip.title}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{activeTip.message}</p>
                    </div>
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            ), {
                duration: 10000,
                position: "bottom-right",
            })

            // Mark as seen
            setSeenTips(prev => new Set(prev).add(activeTip.id))
        }, threshold)

        return () => clearTimeout(timer)
    }, [pathname, seenTips])

    return <>{children}</>
}
