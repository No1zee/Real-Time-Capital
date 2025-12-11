import { headers } from "next/headers"

const trackers = new Map<string, number[]>()

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of trackers.entries()) {
        const active = timestamps.filter(t => now - t < 60 * 60 * 1000)
        if (active.length === 0) {
            trackers.delete(key)
        } else {
            trackers.set(key, active)
        }
    }
}, 60 * 60 * 1000)

export async function rateLimit(limit: number = 5, windowMs: number = 60000) {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    const now = Date.now()
    const timestamps = trackers.get(ip) || []

    const active = timestamps.filter(t => now - t < windowMs)

    if (active.length >= limit) {
        return false // Rate limited
    }

    active.push(now)
    trackers.set(ip, active)
    return true // Allowed
}
