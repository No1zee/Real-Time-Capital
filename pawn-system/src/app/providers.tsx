"use client"

import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="corporate"
            enableSystem={false}
            themes={["luxury", "corporate", "modern"]}
        >
            {children}
        </ThemeProvider>
    )
}
