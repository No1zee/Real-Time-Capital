"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { tourSteps } from "./tour-registry"
import { usePathname } from "next/navigation"

interface TourContextType {
    startTour: () => void
}

const TourContext = createContext<TourContextType>({
    startTour: () => { },
})

export const useTour = () => useContext(TourContext)

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [isReady, setIsReady] = useState(false) // New: Wait for storage read
    const [run, setRun] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const [hasSeenGlobalIntro, setHasSeenGlobalIntro] = useState(false)
    const pathname = usePathname()

    // 1. Initialize State from Storage (Client-side only)
    useEffect(() => {
        setMounted(true)
        let seenIntro = localStorage.getItem('hasSeenGlobalIntro') === 'true'

        // 1b. Legacy Migration: If user has seen the main dashboard tour, imply they've seen the intro
        if (!seenIntro) {
            const seenDashboard = localStorage.getItem('hasSeenTour_/portal')
            // Also check generic 'hasSeenTour' if we ever used it, or check successful login hints? 
            // Stick to dashboard for now as it's the primary landing.
            if (seenDashboard) {
                seenIntro = true
                localStorage.setItem('hasSeenGlobalIntro', 'true')
            }
        }

        setHasSeenGlobalIntro(seenIntro)
        setIsReady(true)
    }, [])

    // 2. Filter steps based on current route AND state
    const steps = tourSteps.filter(step => {
        if (!step.route) return false

        // 1a. Global Intro Check: Rely on React State
        // ONLY filter if we are ready and have seen it. 
        // If not ready, we technically shouldn't render yet, or default to not showing intro to be safe?
        // Better: If isReady is true, apply logic.
        if (isReady && step.id === 'intro-global' && hasSeenGlobalIntro) return false

        if (Array.isArray(step.route)) return step.route.some(r => pathname === r || pathname?.startsWith(r))
        return pathname === step.route || pathname?.startsWith(step.route)
    })

    // 3. Auto-start on first visit logic (Per Route)
    useEffect(() => {
        if (!mounted || !isReady) return

        // Generate a unique key for this route's tour
        const routeKey = `hasSeenTour_${pathname}`
        const hasSeenRoute = localStorage.getItem(routeKey)

        if (!hasSeenRoute && steps.length > 0) {
            setRun(true)
            setStepIndex(0)
        }
    }, [pathname, steps.length, mounted, isReady])

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
                    localStorage.setItem(`hasSeenTour_${pathname}`, "true")
                    return prev
                }
            })
        }, 8000) // Increased to 8s for better readability

        return () => clearTimeout(timer)
    }, [stepIndex, run, steps.length, pathname])


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, step } = data

        // Mark global intro as seen immediately in state and storage
        if ((step as any).id === 'intro-global') {
            if (!hasSeenGlobalIntro) {
                setHasSeenGlobalIntro(true)
                localStorage.setItem('hasSeenGlobalIntro', 'true')
            }
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false)
            if (status === STATUS.SKIPPED) {
                localStorage.setItem(`hasSeenTour_${pathname}`, "true")
            }
        }
    }

    const startTour = () => {
        // Force restart: Clear seen status for this page so it runs even if seen before
        localStorage.removeItem(`hasSeenTour_${pathname}`)
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
                            zIndex: 1000,
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
        </TourContext.Provider>
    )
}
