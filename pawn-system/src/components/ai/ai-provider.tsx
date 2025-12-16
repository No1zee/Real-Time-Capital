"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AIAction, UserContext, AIActionType } from "@/lib/ai/types"
import { analyzeBehavior } from "@/lib/ai/engine"
import { useTour } from "@/components/tour/tour-provider"
import { logPattern } from "@/app/actions/ai"

interface AIContextType {
    suggestion: AIAction | null
    dismissSuggestion: () => void
    triggerAction: (action: AIAction) => void
    resetContext: () => void
    trackAction: (type: string, label: string) => void
    history: AIAction[]
    clearHistory: () => void
    resetDismissed: () => void
    notify: (message: string, actionLabel?: string, action?: () => void, variant?: "default" | "success" | "error" | "warning", id?: string, type?: import("@/lib/ai/types").AIActionType) => void
}

const AIContext = createContext<AIContextType>({
    suggestion: null,
    dismissSuggestion: () => { },
    triggerAction: () => { },
    resetContext: () => { },
    trackAction: () => { },
    history: [],
    clearHistory: () => { },
    resetDismissed: () => { },
    notify: () => { }
})

export const useAI = () => useContext(AIContext)

export function AIProvider({ children, userRole = "GUEST" }: { children: React.ReactNode, userRole?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { startTour, matchCount } = useTour()

    // State
    const [suggestion, setSuggestion] = useState<AIAction | null>(null)
    const [isIdle, setIsIdle] = useState(false)
    const [timeOnPage, setTimeOnPage] = useState(0)
    const [visitCounts, setVisitCounts] = useState<Record<string, number>>({})
    const [history, setHistory] = useState<AIAction[]>([])
    const [dismissedActionIds, setDismissedActionIds] = useState<string[]>([])

    // Load persisted dismissed IDs
    useEffect(() => {
        const stored = localStorage.getItem('ai_dismissed_ids')
        if (stored) {
            try {
                setDismissedActionIds(JSON.parse(stored))
            } catch (e) { console.error("Failed to parse dismissed IDs", e) }
        }
    }, [])

    // Sync dismissed IDs to storage
    useEffect(() => {
        localStorage.setItem('ai_dismissed_ids', JSON.stringify(dismissedActionIds))
    }, [dismissedActionIds])

    // Refs for timers
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
    const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
    const dismissedActionIdsRef = useRef<string[]>([])

    // Sync ref with state so callbacks can read current dismissed list without deps
    useEffect(() => {
        dismissedActionIdsRef.current = dismissedActionIds
    }, [dismissedActionIds])

    // Helper to log pattern
    const trackAction = useCallback((type: string, label: string) => {
        logPattern(type, label)
    }, [])

    const notify = useCallback((message: string, actionLabel?: string, action?: () => void, variant: "default" | "success" | "error" | "warning" = "default", id?: string, type: AIActionType = "SYSTEM_NOTIFICATION") => {
        setSuggestion(prev => {
            const finalId = id || `notify-${Date.now()}`

            // Check if already dismissed
            if (dismissedActionIdsRef.current.includes(finalId)) {
                return prev
            }

            // Prevent re-animation if ID and message are identical
            if (prev?.id === finalId && prev.message === message) {
                return prev
            }

            const newAction: AIAction = {
                id: finalId,
                type,
                message,
                actionLabel,
                action,
                variant, // Pass variant to action
                priority: 100 // Highest priority
            }

            // Add to history (deduplicated by ID at top level, but for log we might want all? No, clean log.)
            setHistory(h => {
                if (h.some(x => x.id === finalId)) return h
                // Chat should be at the END of history if it's a chat interface? 
                // Currently history is reversed (newest first).
                return [newAction, ...h].slice(0, 50)
            })

            return newAction
        })
    }, [])

    // 1. Visit Counting
    useEffect(() => {
        setVisitCounts(prev => ({
            ...prev,
            [pathname]: (prev[pathname] || 0) + 1
        }))
        setTimeOnPage(0)
        setSuggestion(null) // Clear suggestions on nav
    }, [pathname])

    // 2. Time on Page Tracker
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeOnPage(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [pathname])

    // 3. Idle Tracker
    const resetIdleTimer = useCallback(() => {
        setIsIdle(false)
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = setTimeout(() => setIsIdle(true), 15000) // 15s idle threshold
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', resetIdleTimer)
        window.addEventListener('keydown', resetIdleTimer)
        window.addEventListener('click', resetIdleTimer)
        window.addEventListener('scroll', resetIdleTimer)

        resetIdleTimer() // Init

        return () => {
            window.removeEventListener('mousemove', resetIdleTimer)
            window.removeEventListener('keydown', resetIdleTimer)
            window.removeEventListener('click', resetIdleTimer)
            window.removeEventListener('scroll', resetIdleTimer)
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        }
    }, [resetIdleTimer])

    // 4. Wallet Context State
    const [walletData, setWalletData] = useState({ walletBalance: 0, auctionDeposit: 0 })

    // 5. Fetch Wallet Context
    useEffect(() => {
        // Only fetch for logged in users (or if role is not guest)
        if (userRole !== "GUEST") {
            import("@/app/actions/ai-context").then(({ getAIContextData }) => {
                getAIContextData().then(setWalletData)
            })
        }
    }, [pathname, userRole])

    // 6. AI Analysis Loop
    useEffect(() => {
        const isDemo = localStorage.getItem('isDemoMode') === 'true'
        const hasSeenTour = localStorage.getItem(`hasSeenTour_${pathname}`) === 'true'

        const context: UserContext = {
            path: pathname,
            timeOnPage,
            visitCount: visitCounts[pathname] || 1,
            isIdle,
            hasSeenTour,
            isDemoMode: isDemo,
            userRole,
            tourMatches: matchCount,
            walletBalance: walletData.walletBalance,
            auctionDeposit: walletData.auctionDeposit,
            recentErrors: [] // Phase 2: Hook into toast sys
        }

        const action = analyzeBehavior(context)

        // Only set if not dismissed newly
        if (action && !dismissedActionIds.includes(action.id)) {

            // AUTO-TRIGGER LOGIC
            if (action.autoTrigger) {
                triggerAction(action)
                return // Don't set suggestion if triggered
            }

            // Don't override higher priority actions with lower ones unless the higher one is done?
            // Simple logic: Just set it if we don't have one or if it's higher priority
            setSuggestion(prev => {
                const isNew = !prev || prev.id !== action.id

                if (isNew) {
                    setHistory(h => {
                        if (h.some(x => x.id === action.id)) return h
                        return [action, ...h].slice(0, 50)
                    })
                }

                if (!prev) return action
                if (action.priority > prev.priority) return action
                return prev
            })
        }

    }, [timeOnPage, isIdle, pathname, visitCounts, userRole, dismissedActionIds, matchCount, walletData]) // Added dependencies

    const clearHistory = () => setHistory([])
    const resetDismissed = () => {
        setDismissedActionIds([])
        localStorage.removeItem('ai_dismissed_ids')
    }

    // 5. Action Handlers
    const dismissSuggestion = (actionId?: string) => {
        const idToDismiss = actionId || suggestion?.id
        if (idToDismiss) {
            setDismissedActionIds(prev => [...prev, idToDismiss])
            setSuggestion(null)
        }
    }

    const triggerAction = (action: AIAction) => {
        if (action.type === "SUGGEST_TOUR") {
            startTour()
            trackAction("TOUR_START", pathname)
        } else if (action.type === "SUGGEST_DEMO") {
            localStorage.removeItem('hasSeenGlobalIntro')
            localStorage.setItem('isDemoMode', 'true')
            window.location.href = `${window.location.pathname}?demo=true`
            trackAction("DEMO_START", pathname)
        } else if (action.action) {
            action.action()
        }

        dismissSuggestion(action.id)
    }

    const resetContext = () => {
        setDismissedActionIds([])
        setSuggestion(null)
    }

    return (
        <AIContext.Provider value={{ suggestion, dismissSuggestion, triggerAction, resetContext, trackAction, notify, history, clearHistory, resetDismissed }}>
            {children}
        </AIContext.Provider>
    )
}
