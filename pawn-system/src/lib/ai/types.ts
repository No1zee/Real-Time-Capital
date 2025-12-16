export type AIActionType =
    | "SUGGEST_TOUR"
    | "SUGGEST_DEMO"
    | "OFFER_TIP"
    | "IDLE_CHECK"
    | "GREETING"
    | "SYSTEM_NOTIFICATION"
    | "USER_MESSAGE"
    | "AI_RESPONSE"

export interface AIAction {
    id: string
    type: AIActionType
    message: string
    actionLabel?: string
    action?: () => void
    priority: number // 1-10
    autoTrigger?: boolean
    variant?: "default" | "success" | "error" | "warning" // Style variants
}

export interface UserContext {
    path: string
    timeOnPage: number // seconds
    visitCount: number
    isIdle: boolean
    hasSeenTour: boolean
    isDemoMode: boolean
    userRole: string
    tourMatches: number
    // Phase 1: Context Awareness
    walletBalance?: number
    auctionDeposit?: number
    recentErrors: string[] // Track recent error toasts or form errors
}

export interface AITip {
    id: string
    pathPattern: string | RegExp
    message: string
    condition?: (context: UserContext) => boolean
}
