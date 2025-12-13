"use client"

import { useEffect, useState } from "react"

export function Greeting({ name }: { name?: string | null }) {
    const [greeting, setGreeting] = useState("Welcome back")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Good morning")
        else if (hour < 18) setGreeting("Good afternoon")
        else setGreeting("Good evening")
    }, [])

    return (
        <div>
            <h2 id="dashboard-title" className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {greeting}, <span className="text-primary">{name || "Traader"}</span>
            </h2>
            <p className="text-sm md:text-base text-slate-400">Here is an overview of your account.</p>
        </div>
    )
}
