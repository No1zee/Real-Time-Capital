"use client"

import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="sunset"
            enableSystem={false}
            themes={["light", "dark", "luxury", "corporate", "modern", "sunset"]}
        >
            {children}
        </ThemeProvider>
    )
}
