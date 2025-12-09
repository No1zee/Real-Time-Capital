import { NextRequest, NextResponse } from "next/server"
import { activateScheduledAuctions, endExpiredAuctions } from "@/lib/auction-processor"

/**
 * API Route for Auction Lifecycle Check
 * Called by GitHub Actions every 5 minutes
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authorization
        const authHeader = request.headers.get("authorization")
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

        if (authHeader !== expectedAuth) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        console.log("[Auction Lifecycle] Starting check at", new Date().toISOString())

        // Activate scheduled auctions
        const activationResults = await activateScheduledAuctions()
        console.log("[Auction Lifecycle] Activated:", activationResults.activated.length)

        // End expired auctions
        const endingResults = await endExpiredAuctions()
        console.log("[Auction Lifecycle] Ended:", endingResults.ended.length)

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            results: {
                activated: {
                    count: activationResults.activated.length,
                    auctionIds: activationResults.activated,
                    errors: activationResults.errors
                },
                ended: {
                    count: endingResults.ended.length,
                    auctionIds: endingResults.ended,
                    errors: endingResults.errors
                }
            }
        }

        console.log("[Auction Lifecycle] Complete:", response)

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error("[Auction Lifecycle] Error:", error)

        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}

// Optional: Allow GET requests for testing in development
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Method not allowed" },
            { status: 405 }
        )
    }

    // In development, allow GET without auth for easy testing
    return POST(request)
}
