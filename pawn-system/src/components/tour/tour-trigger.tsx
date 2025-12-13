"use client"

import { useTour } from "@/components/tour/tour-provider"
import { Button } from "@/components/ui/button"

export function TourTrigger() {
    const { startTour } = useTour()

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="w-full justify-start text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
        >
            <span className="mr-2 text-base">✨</span> Show Walkthrough
        </Button>
    )
}
