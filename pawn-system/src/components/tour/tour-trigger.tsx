"use client"

import { useTour } from "@/components/tour/tour-provider"
import { Button } from "@/components/ui/button"

export function TourTrigger() {
    const { startTour } = useTour()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={startTour}
            className="w-full justify-start text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
        >
            <span className="mr-2">✨</span> Start MVP Tour
        </Button>
    )
}
