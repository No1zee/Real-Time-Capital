import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type UserTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

interface TierBadgeProps {
    tier: string // Using string to be safe with incoming data
    className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
    // Normalize case
    const safeTier = (tier || "BRONZE").toUpperCase() as UserTier

    const styles = {
        BRONZE: "bg-amber-700/10 text-amber-800 border-amber-200 dark:text-amber-500 hover:bg-amber-700/20",
        SILVER: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200",
        GOLD: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-200",
        PLATINUM: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 hover:bg-cyan-200"
    }

    return (
        <Badge variant="outline" className={cn("font-semibold", styles[safeTier] || styles.BRONZE, className)}>
            {safeTier}
        </Badge>
    )
}
