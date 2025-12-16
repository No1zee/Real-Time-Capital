"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { tourSteps } from "./tour-registry"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import confetti from "canvas-confetti"

interface TourContextType {
    startTour: () => void
    matchCount: number // How many steps match current route/role
}

const TourContext = createContext<TourContextType>({
    startTour: () => { },
    matchCount: 0,
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
    const [isDemoMode, setIsDemoMode] = useState(false)

    // 1. Initialize State from Storage (Client-side only) & Handle Persistence
    useEffect(() => {
        setMounted(true)
        const seenIntro = localStorage.getItem('hasSeenGlobalIntro') === 'true'

        // Demo Mode Persistence Logic
        const demoParam = searchParams?.get('demo')
        const storedDemo = localStorage.getItem('isDemoMode')

        // Logic: Default to TRUE (Always On) unless explicitly set to 'false'
        let activeDemo = true

        if (demoParam === 'false') {
            activeDemo = false
            localStorage.setItem('isDemoMode', 'false')
        } else if (storedDemo === 'false') {
            activeDemo = false
        } else {
            // Default case (or demo=true or storedDemo=true)
            activeDemo = true
            if (activeDemo && storedDemo !== 'true') {
                localStorage.setItem('isDemoMode', 'true') // Ensure compatibility
            }
        }

        setIsDemoMode(activeDemo)

        // Respect stored seen state even in Default Demo Mode
        setHasSeenGlobalIntro(seenIntro)
        setIsReady(true)
    }, [searchParams])

    // 2. Filter steps based on current route AND state AND role
    const userRole = user?.role || "GUEST"

    const steps = tourSteps.filter(step => {
        if (!step.route) return false

        // Role Filter
        if (step.roles && !step.roles.includes(userRole)) return false

        // 1a. Global Intro Check: Rely on React State
        // Priority Override: REMOVED. Even in Demo Mode (which is now default), respect the 'seen' state so we don't spam the user.
        // if (isDemoMode && (step.id === 'intro-global' || step.id === 'intro-guest' || step.id === 'intro-user')) return true

        // ONLY filter if we are ready and have seen it. 
        if (isReady && (step.id === 'intro-global' || step.id === 'intro-guest' || step.id === 'intro-user') && hasSeenGlobalIntro) return false

        if (Array.isArray(step.route)) return step.route.some(r => pathname === r || pathname?.startsWith(r))
        return pathname === step.route || pathname?.startsWith(step.route)
    })



    // 3. Auto-start logic REMOVED. 
    // We now rely entirely on AIProvider or Manual Triggers to start the tour.
    // This prevents infinite loops where filtered steps changing re-triggers the tour.

    // 3b. Force Run in Demo Mode
    // 3b. Force Run in Demo Mode - REMOVED to prevent unwanted popups.
    // Tours must be manually simulated or triggered by AI.
    /*
    useEffect(() => {
        if (isDemoMode && isReady && mounted && steps.length > 0) {
            setRun(true)
            setStepIndex(0) 
        }
    }, [isDemoMode, isReady, mounted, steps.length])
    */

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
            console.error(`Tour Error: ${type} - Target: ${step.target}`)
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
            // Save state so it doesn't auto-run again
            localStorage.setItem(`hasSeenTour_${pathname}`, "true")

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

        // Also enable demo mode if triggered manually via startTour (optional, but good for "Show Walkthrough" button)
        // localStorage.setItem('isDemoMode', 'true') 
        // setIsDemoMode(true)
        // Actually, keep startTour distinct from "System Demo Mode" to allow simple restarts without full demo effects.
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
        <TourContext.Provider value={{ startTour, matchCount: steps.length }}>
            {children}
            {mounted && steps.length > 0 && (
                <Joyride
                    key={pathname} // CRITICAL: Force re-mount on route change to ensure clean state
                    steps={steps.map(s => ({ ...s, disableBeacon: true }))} // FORCE: Disable beacons globally
                    run={run}
                    stepIndex={stepIndex}
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
            {/* Demo Mode Indicator removed - Clutter reduction */}
        </TourContext.Provider>
    )
}
