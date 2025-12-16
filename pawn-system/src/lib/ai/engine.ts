import { AIAction, AITip, UserContext } from "./types"

const TIPS: AITip[] = [
    {
        id: "dashboard-overview",
        pathPattern: "/portal",
        message: "Your Command Center: Track active loans, total debt, and pawned items here. We calculate your liquidity so you don't have to.",
        condition: (ctx) => ctx.path === "/portal" && ctx.visitCount < 5
    },
    {
        id: "inventory-search",
        pathPattern: /\/portal\/items/,
        message: "Tip: Use the filters to quickly find specific items like jewelry or electronics.",
        condition: (ctx) => ctx.visitCount > 1
    },
    {
        id: "auction-live",
        pathPattern: /\/portal\/auctions/,
        message: "Live auctions happen in real-time. Make sure you have enough deposit balance before bidding!",
        condition: (ctx) => !ctx.isDemoMode
    }
]

export function analyzeBehavior(context: UserContext): AIAction | null {
    // 1. Priority: Demo Mode Suggestion for Guests
    if (!context.isDemoMode && context.userRole === "GUEST" && context.timeOnPage > 5 && context.visitCount < 2) {
        return {
            id: "suggest-demo",
            type: "SUGGEST_DEMO",
            message: "Want to explore freely? Try our interactive Demo Mode with fake money!",
            actionLabel: "Start Demo",
            priority: 10
        }
    }

    // 2. Priority: Tour Suggestion
    if (context.tourMatches > 0 && !context.hasSeenTour && context.timeOnPage > 3 && context.visitCount < 3) {
        return {
            id: "suggest-tour",
            type: "SUGGEST_TOUR",
            message: "New here? Let me show you around with a quick tour.",
            actionLabel: "Start Tour",
            priority: 9,
            autoTrigger: true
        }
    }

    // 3. Priority: Idle Check
    if (context.isIdle && context.timeOnPage > 30) {
        return {
            id: "idle-help",
            type: "IDLE_CHECK",
            message: "Need any help? I'm here if you have questions.",
            actionLabel: "Ask Help",
            priority: 5
        }
    }

    // 4. Priority: Smart Context Rules

    // Rule: Low Wallet on Auction or Pawn Pages
    if (context.walletBalance !== undefined && context.walletBalance < 10 && (context.path.includes('/auctions') || context.path.includes('/pawn'))) {
        return {
            id: "low-balance-warning",
            type: "OFFER_TIP",
            message: `You only have $${context.walletBalance} in your wallet. You'll need to top up to bid or pay fees.`,
            actionLabel: "Add Funds",
            variant: "warning",
            priority: 8
        }
    }

    // Rule: Missing Deposit for Auctions
    if (context.path.includes('/auctions') && context.auctionDeposit !== undefined && context.auctionDeposit < 50 && !context.isDemoMode) {
        return {
            id: "deposit-required",
            type: "OFFER_TIP",
            message: "Active auctions require a refundable $50 security deposit to participate.",
            actionLabel: "Pay Deposit",
            priority: 8
        }
    }

    // 5. Contextual Tips
    const relevantTip = TIPS.find(tip => {
        const match = tip.pathPattern instanceof RegExp
            ? tip.pathPattern.test(context.path)
            : context.path === tip.pathPattern

        return match && (!tip.condition || tip.condition(context))
    })

    if (relevantTip) {
        return {
            id: relevantTip.id,
            type: "OFFER_TIP",
            message: relevantTip.message,
            priority: 3
        }
    }

    return null
}
