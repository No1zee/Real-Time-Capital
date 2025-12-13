"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { tourSteps } from "./tour-registry"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import confetti from "canvas-confetti"

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
            if (status === STATUS.FINISHED) {
                // Celebration!
                const end = Date.now() + 3 * 1000; // 3 seconds
                const colors = ['#06b6d4', '#ffffff', '#f59e0b']; // Cyan, White, Amber

                (function frame() {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
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

    const { theme } = useTheme()
    const isDark = theme === "dark"

    // Mobile Detection
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Premium Styles Configuration
    const styles = {
        options: {
            arrowColor: isDark ? '#1e293b' : '#ffffff',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            overlayColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#06b6d4', // Cyan Main
            textColor: isDark ? '#f8fafc' : '#0f172a',
            zIndex: 10000,
        },
        tooltip: {
            borderRadius: isMobile ? '0.75rem' : '1rem', // Smaller radius on mobile
            boxShadow: isDark
                ? '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)'
                : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            padding: isMobile ? '0.75rem' : '1.5rem', // Reduced padding (was 1.5rem)
            fontSize: isMobile ? '0.85rem' : '0.95rem', // Smaller font (was 0.95rem)
            backgroundColor: isDark ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)', // Remove opacity for better readibility on small screens? Kept solid for safety.
            // backdropFilter: 'blur(12px)', // Mobile performance might suffer, potential cause of "bulky" feel if laggy? Keeping it off the solid color suggestion above implies removing this, but let's keep it for premium feel if possible. 
            // Actually, let's keep backdrop filter but ensure bg has high alpha. The previous code had 0.9/0.95 alpha.
        },
        tooltipContent: {
            padding: isMobile ? '2px 0 5px 0' : '5px 0 10px 0'
        },
        buttonNext: {
            display: 'none' // Hide next button for auto-play
        },
        buttonBack: {
            display: 'none'
        },
        spotlight: {
            borderRadius: isMobile ? '0.5rem' : '1rem',
        }
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
                    styles={styles}
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
