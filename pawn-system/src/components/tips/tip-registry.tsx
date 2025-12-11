import { Lightbulb, Info, FileText, Gavel, TrendingUp, AlertCircle, Clock, Package, Shield, Activity, Target, BarChart2 } from "lucide-react"

export interface ProTip {
    route: string | string[] // Can match multiple routes
    id: string
    title: string
    message: string
    icon?: any
    idleThreshold?: number
}

export const proTips: ProTip[] = [
    {
        id: "loans-filter",
        route: "/portal/loans",
        title: "Finding a Loan?",
        message: "You can filter your loans by status (Active, Overdue) using the dropdown on the top right.",
        icon: Lightbulb
    },
    {
        id: "valuations-compare",
        route: "/admin/valuations",
        title: "Valuation Check",
        message: "AI estimations are conservative. Check the 'Comparable Sales' tab for recent market data.",
        icon: Info
    },
    {
        id: "reports-export",
        route: "/admin/reports",
        title: "Need a Record?",
        message: "Click the 'Export' button to download a formal audit PDF for your monthly filing.",
        icon: FileText
    },
    {
        id: "new-loan-customer",
        route: "/loans/new",
        title: "Fast Entry",
        message: "Tip: Enter the National ID first. If they are a returning customer, we'll auto-fill the rest.",
        icon: Lightbulb,
        idleThreshold: 15000 // Wait longer here as they might just be typing
    },
    {
        id: "admin-kpi",
        route: ["/admin/dashboard", "/admin"],
        title: "Business Health",
        message: "The top KPIs update in real-time. Click 'View Business Intelligence' for a deep dive.",
        icon: Info,
        idleThreshold: 3000
    },
    {
        id: "portal-welcome",
        route: "/portal",
        title: "Welcome Back",
        message: "Check your 'Active Loans' card to see upcoming payments due this week.",
        icon: Lightbulb,
        idleThreshold: 3000
    },
    {
        id: "admin-users",
        route: "/admin/users",
        title: "User Oversight",
        message: "Click on any user row to see their full history, including loans, pawns, and verification documents.",
        icon: Info,
        idleThreshold: 3000
    },
    // Context Tips (Hover)
    {
        id: "kpi-redemption",
        route: "hover",
        title: "Loan Recovery Rate",
        message: "The percentage of customers who successfully repay their loan and retrieve their item. High rates mean trusted, repeat business.",
        icon: Info
    },
    {
        id: "kpi-active-loan",
        route: "hover",
        title: "Active Loan Book",
        message: "The total principal amount currently lent out. This represents your current financial exposure in the market.",
        icon: Info
    },
    {
        id: "kpi-sell-through",
        route: "hover",
        title: "Sell-Through Rate",
        message: "The percentage of auctioned items that are successfully sold. Low rates may indicate pricing issues.",
        icon: Info
    },
    {
        id: "kpi-yield",
        route: "hover",
        title: "Portfolio Yield",
        message: "Your average monthly return on capital from loan interest. This is your primary profit driver.",
        icon: Lightbulb
    },
    // Admin Dashboard Cards
    {
        id: "admin-total-users",
        route: "hover",
        title: "Total Users",
        message: "The total count of registered accounts on the platform, including admins, staff, and customers.",
        icon: Info
    },
    {
        id: "admin-active-auctions",
        route: "hover",
        title: "Active Auctions",
        message: "The number of items currently listed in live auctions and available for bidding.",
        icon: Gavel
    },
    {
        id: "admin-total-volume",
        route: "hover",
        title: "Total Volume",
        message: "The cumulative value of all completed payments processed through the system.",
        icon: TrendingUp
    },
    // Portal Dashboard Cards
    {
        id: "portal-total-debt",
        route: "hover",
        title: "Principal Due",
        message: "The total amount you owe across all your active loans. This does not include future interest.",
        icon: AlertCircle
    },
    {
        id: "portal-active-loans",
        route: "hover",
        title: "Active Loans",
        message: "Loans that are currently in progress. Ensure you pay interest on time to avoid default.",
        icon: FileText
    },
    {
        id: "portal-pending-loans",
        route: "hover",
        title: "Pending Applications",
        message: "Loan applications that are currently under review by our staff.",
        icon: Clock
    },
    {
        id: "portal-items-pawned",
        route: "hover",
        title: "Collateral Held",
        message: "The number of items currently stored in our secure vault as collateral for your loans.",
        icon: Package
    },
    // Auction Cards
    {
        id: "auction-listing",
        route: "hover",
        title: "Live Bidding Engine",
        message: "Dynamic real-time auction with anti-snipe protection. Bids in the final 60s extend the clock. Outbid rivals and secure verified assets when the timer hits zero.",
        icon: Gavel
    },
    // Asset Register (BRD Context)
    {
        id: "asset-valuation",
        route: "hover",
        title: "Valuation Logic",
        message: "Per BRD Rule 4.2: Maximum loan offers are capped at 40% of this market valuation to mitigate volatility risk.",
        icon: Info
    },
    {
        id: "asset-status",
        route: "hover",
        title: "Lifecycle Status",
        message: "Tracks the asset's legal physical location. 'IN_PAWN' means it must be in the vault. 'IN_AUCTION' moves it to the sales floor.",
        icon: Package
    },
    {
        id: "asset-loan-info",
        route: "hover",
        title: "Linked Contracts",
        message: "Direct link to the active pawn agreement. If 'Defaulted', the asset can be legally liquidated after the 14-day grace period.",
        icon: FileText
    },
    // User Profile Context
    {
        id: "profile-permissions",
        route: "hover",
        title: "Access Control",
        message: "Grants granular access to system modules. 'SUPER_ADMIN' overrides all specific flags. Revoking 'LOGIN' suspends the account immediately.",
        icon: Shield
    },
    {
        id: "profile-health",
        route: "hover",
        title: "Risk Score",
        message: "Composite score based on disputes, payment failures, and verification status. High dispute count (>3) triggers automatic bidding restrictions.",
        icon: Activity
    },
    {
        id: "profile-marketing",
        route: "hover",
        title: "Persona Engine",
        message: "AI-driven classification based on browsing history and bid patterns. Used to tailor email campaigns and push notifications.",
        icon: Target
    },
    {
        id: "profile-interests",
        route: "hover",
        title: "Behavior Analysis",
        message: "Heatmap of category engagement. 'High Intensity' zones indicate likely conversion areas for future pawn offers.",
        icon: BarChart2
    }
    // Profile/User Tips
    // {
    //     id: "profile-permissions",
    //     ... (this one exists)
    // }
]
