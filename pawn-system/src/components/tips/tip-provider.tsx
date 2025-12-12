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
            // Trigger Toast with Premium Glass Look
            toast.custom((t) => (
                <div className="relative overflow-hidden flex items-start gap-4 w-full p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-slate-950/80 border border-white/10 transition-all duration-300 ring-1 ring-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out slide-in-from-right-10 fade-in zoom-in-95">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-amber-500/10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-600" />

                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-cyan-500/30 text-cyan-400 mt-0.5 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <Bot className="w-5 h-5" />
                    </div>

                    <div className="relative flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/20">
                                System Tip
                            </span>
                            <span className="text-xs text-slate-500">• {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-bold text-slate-100 text-sm mb-1.5 leading-tight">{activeTip.title}</p>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">{activeTip.message}</p>
                    </div>

                    <button
                        onClick={() => toast.dismiss(t)}
                        className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 active:scale-95"
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
