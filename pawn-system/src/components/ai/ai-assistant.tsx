"use client"

import { useAI } from "./ai-provider"
import { Button } from "@/components/ui/button"
import { Bot, Sparkles, X, PlayCircle, Map, MessageCircleQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useTour } from "@/components/tour/tour-provider"
import { motion, AnimatePresence } from "framer-motion"
import { AIHistoryPanel } from "./ai-panel"

const getVariantStyles = (type: string, variant?: string) => {
    if (type !== "SYSTEM_NOTIFICATION") return "bg-white/90 dark:bg-slate-900/90 border-border/40"

    switch (variant) {
        case "success": return "bg-emerald-500/10 border-emerald-500/50 dark:bg-emerald-900/20"
        case "error": return "bg-red-500/10 border-red-500/50 dark:bg-red-900/20"
        case "warning": return "bg-amber-500/10 border-amber-500/50 dark:bg-amber-900/20"
        default: return "bg-blue-500/10 border-blue-500/50 dark:bg-blue-900/20"
    }
}

const getIconStyles = (type: string, variant?: string) => {
    if (type !== "SYSTEM_NOTIFICATION") return "bg-primary/20 text-primary"

    switch (variant) {
        case "success": return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        case "error": return "bg-red-500/20 text-red-600 dark:text-red-400"
        case "warning": return "bg-amber-500/20 text-amber-600 dark:text-amber-400"
        default: return "bg-blue-500/20 text-blue-600 dark:text-blue-400"
    }
}

const getButtonStyles = (type: string, variant?: string) => {
    if (type !== "SYSTEM_NOTIFICATION") return "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"

    switch (variant) {
        case "success": return "bg-emerald-600 hover:bg-emerald-700 text-white"
        case "error": return "bg-red-600 hover:bg-red-700 text-white"
        case "warning": return "bg-amber-600 hover:bg-amber-700 text-white"
        default: return "bg-blue-600 hover:bg-blue-700 text-white"
    }
}

export function AIAssistant() {
    const { suggestion, dismissSuggestion, triggerAction } = useAI()
    const { startTour } = useTour()
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    // Manual Actions
    const handleStartDemo = () => {
        localStorage.removeItem('hasSeenGlobalIntro')
        localStorage.setItem('isDemoMode', 'true')
        window.location.reload()
    }

    return (
        <>
            <AIHistoryPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

            <div className="fixed bottom-6 right-6 z-[11000] flex flex-col items-end gap-4">

                {/* AI Suggestion Bubble Removed - Notifications are now silent until panel is opened */}

                {/* Main Toggle Button */}
                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl transition-all duration-500 hover:scale-110",
                        isPanelOpen ? "bg-slate-800 rotate-90" : "bg-gradient-to-tr from-cyan-500 to-blue-600 animate-pulse-slow"
                    )}
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                    {isPanelOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7 text-white" />}
                </Button>
            </div>
        </>
    )
}
