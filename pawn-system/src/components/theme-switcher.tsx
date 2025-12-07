"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Ensure hydration match
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon">
                <Palette className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="glass-panel">
                    <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("luxury")} className={theme === "luxury" ? "bg-accent" : ""}>
                    Default (Gold)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("corporate")} className={theme === "corporate" ? "bg-accent" : ""}>
                    Corporate (Blue)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("modern")} className={theme === "modern" ? "bg-accent" : ""}>
                    Modern (Green)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
