"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function DemoTrigger({ className }: { className?: string }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => {
                localStorage.removeItem('hasSeenGlobalIntro')
                localStorage.setItem('isDemoMode', 'true')
                const url = new URL(window.location.href)
                url.searchParams.set("demo", "true")
                window.location.href = url.toString()
            }}
            className={className}
        >
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold">
                Start Demo
            </span>
        </Button>
    )
}
