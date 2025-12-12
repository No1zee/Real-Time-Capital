"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { tourSteps } from "./tour-registry"
import { usePathname, useSearchParams } from "next/navigation"

interface TourContextType {
    startTour: () => void
}

const TourContext = createContext<TourContextType>({
    startTour: () => { },
})

export const useTour = () => useContext(TourContext)

export function TourProvider({ children, user }: { children: React.ReactNode, user?: any }) {
    const [mounted, setMounted] = useState(false)
    const [isReady, setIsReady] = useState(false) // New: Wait for storage read
    const [run, setRun] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const [hasSeenGlobalIntro, setHasSeenGlobalIntro] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isDemoMode = searchParams?.get('demo') === 'true'

    // 1. Initialize State from Storage (Client-side only)
    useEffect(() => {
        setMounted(true)
        const seenIntro = localStorage.getItem('hasSeenGlobalIntro') === 'true'
        // If demo mode, force seenIntro to false
        setHasSeenGlobalIntro(isDemoMode ? false : seenIntro)
        setIsReady(true)
    }, [isDemoMode])

    // 2. Filter steps based on current route AND state AND role
    const userRole = user?.role || "GUEST"

    const steps = tourSteps.filter(step => {
        if (!step.route) return false

        // Role Filter
        if (step.roles && !step.roles.includes(userRole)) return false

        // 1a. Global Intro Check: Rely on React State
        // Priority Override: If Demo Mode, ALWAYS include intro, ignoring seen state
        if (isDemoMode && (step.id === 'intro-global' || step.id === 'intro-guest' || step.id === 'intro-user')) return true

        // ONLY filter if we are ready and have seen it. 
        if (isReady && (step.id === 'intro-global' || step.id === 'intro-guest' || step.id === 'intro-user') && hasSeenGlobalIntro) return false

        if (Array.isArray(step.route)) return step.route.some(r => pathname === r || pathname?.startsWith(r))
        return pathname === step.route || pathname?.startsWith(step.route)
    })



    // 3. Auto-start on first visit logic (Per Route)
    useEffect(() => {
        if (!mounted || !isReady) return

        // Generate a unique key for this route's tour
        const routeKey = `hasSeenTour_${pathname}`
        // const hasSeenRoute = localStorage.getItem(routeKey) // MVP: Override history

        if (steps.length > 0) {
            setRun(true)
            setStepIndex(0)
        }
    }, [pathname, steps.length, mounted, isReady])

    // 3b. Force Run in Demo Mode
    useEffect(() => {
        if (isDemoMode && isReady && mounted && steps.length > 0) {
            setRun(true)
            setStepIndex(0) // Start from beginning
        }
    }, [isDemoMode, isReady, mounted, steps.length])

    // 4. Reset index when route changes
    useEffect(() => {
        if (mounted && isReady) setStepIndex(0)
    }, [pathname, mounted, isReady])

    // 5. Auto-Advance Timer
    useEffect(() => {
        if (!run || steps.length === 0) return

        if (stepIndex >= steps.length) {
            setRun(false)
            return
        }

        const timer = setTimeout(() => {
            setStepIndex((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1
                } else {
                    setRun(false)
                    // localStorage.setItem(`hasSeenTour_${pathname}`, "true") // MVP: Don't save seen state so it runs every refresh
                    return prev
                }
            })
        }, 8000) // Increased to 8s for better readability

        return () => clearTimeout(timer)
    }, [stepIndex, run, steps.length, pathname])


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, step } = data

        if (status === 'error' || type === 'error:target_not_found') {
            import("sonner").then(({ toast }) => {
                toast.error(`Tour Error: ${type} - Target: ${step.target}`, { duration: 10000 })
            })
        }

        // Mark global intro as seen immediately in state and storage
        if ((step as any).id === 'intro-global' || (step as any).id === 'intro-guest' || (step as any).id === 'intro-user') {
            if (!hasSeenGlobalIntro) {
                setHasSeenGlobalIntro(true)
                localStorage.setItem('hasSeenGlobalIntro', 'true')
            }
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false)
            if (status === STATUS.SKIPPED) {
                // localStorage.setItem(`hasSeenTour_${pathname}`, "true") // MVP Check
            }
        }
    }

    const startTour = () => {
        // Force restart: Clear seen status for this page so it runs even if seen before
        localStorage.removeItem(`hasSeenTour_${pathname}`)
        localStorage.removeItem('hasSeenGlobalIntro') // For Demo: Clear global intro too
        setHasSeenGlobalIntro(false) // Reset state to allow intro step logic to pass
        setRun(true)
        setStepIndex(0)
    }

    return (
        <TourContext.Provider value={{ startTour }}>
            {children}
            {mounted && steps.length > 0 && (
                <Joyride
                    key={pathname} // CRITICAL: Force re-mount on route change to ensure clean state
                    steps={steps}
                    run={run}
                    stepIndex={stepIndex}
                    // disableBeacon={true} // Commented out to fix Vercel build type error
                    // disableOverlay={false} // Default is false, which means SHOW overlay. We explicitly want this for immersion.
                    showSkipButton
                    hideCloseButton={false} // Allow closing
                    disableScrolling={true} // Avoid jumping around too much
                    callback={handleJoyrideCallback}
                    styles={{
                        options: {
                            arrowColor: '#fff',
                            backgroundColor: '#fff',
                            overlayColor: 'rgba(0, 0, 0, 0.5)',
                            primaryColor: '#06b6d4', // Cyan Main
                            textColor: '#0f172a', // Slate 900
                            zIndex: 10000,
                        },
                        tooltip: {
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            padding: '1rem',
                            fontSize: '0.9rem',
                        },
                        tooltipContent: {
                            padding: '5px 10px'
                        },
                        buttonNext: {
                            display: 'none' // Hide next button for auto-play
                        },
                        buttonBack: {
                            display: 'none'
                        }
                    }}
                    floaterProps={{
                        hideArrow: false,
                        disableAnimation: true, // Reduce motion issues
                    }}
                />
            )}
            {/* VISUAL DEBUG BANNER - TEMPORARY */}
            {isDemoMode && (
                <div className="fixed top-20 right-4 z-[99999] bg-red-900/90 text-white p-4 rounded-lg shadow-xl text-xs font-mono border border-red-500 pointer-events-none">
                    <p className="font-bold underline mb-1">Tour Debugger</p>
                    <p>Path: {pathname}</p>
                    <p>Steps: {steps.length}</p>
                    <p>Run: {String(run)}</p>
                    <p>SeenGlobal: {String(hasSeenGlobalIntro)}</p>
                    <p>Ready: {String(isReady)}</p>
                    <p>Mounted: {String(mounted)}</p>
                </div>
            )}
        </TourContext.Provider>
    )
}
