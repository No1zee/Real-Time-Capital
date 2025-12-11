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
    const [run, setRun] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const pathname = usePathname()

    // 1. Filter steps based on current route
    const steps = tourSteps.filter(step => {
        if (!step.route) return false

        // 1a. Global Intro Check: If user has seen the intro anywhere, distinct from route-specific tours, hide it.
        const hasSeenIntro = typeof window !== 'undefined' ? localStorage.getItem('hasSeenGlobalIntro') : null
        if (step.id === 'intro-global' && hasSeenIntro) return false

        if (Array.isArray(step.route)) return step.route.some(r => pathname === r || pathname?.startsWith(r))
        return pathname === step.route || pathname?.startsWith(step.route)
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // 2. Auto-start on first visit logic (Per Route)
    useEffect(() => {
        // Generate a unique key for this route's tour
        // We strip dynamic segments if needed, but for now exact path is fine
        const routeKey = `hasSeenTour_${pathname}`
        const hasSeenRoute = localStorage.getItem(routeKey)

        if (!hasSeenRoute && steps.length > 0) {
            setRun(true)
            setStepIndex(0) // Ensure we start at 0
        }
    }, [pathname, steps.length])

    // 3. Reset index when route changes so we pick up new steps
    useEffect(() => {
        setStepIndex(0)
    }, [pathname])

    // 4. Auto-Advance Timer (Robust)
    useEffect(() => {
        if (!run || steps.length === 0) return

        // Safety: If index is already out of bounds, stop.
        if (stepIndex >= steps.length) {
            setRun(false)
            return
        }

        const timer = setTimeout(() => {
            setStepIndex((prev) => {
                // Double check boundary inside the closure
                if (prev < steps.length - 1) {
                    return prev + 1
                } else {
                    // End of tour for this page
                    setRun(false)
                    localStorage.setItem(`hasSeenTour_${pathname}`, "true")
                    return prev // validation: don't increment beyond max
                }
            })
        }, 5000) // 5 seconds per bubble for better reading time

        return () => clearTimeout(timer)
    }, [stepIndex, run, steps.length, pathname])


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index, step } = data

        // Mark global intro as seen if we just saw it
        if ((step as any).id === 'intro-global') {
            localStorage.setItem('hasSeenGlobalIntro', 'true')
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
