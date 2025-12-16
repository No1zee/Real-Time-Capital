import { Star, ShieldCheck, ShieldAlert, Shield } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

interface UserTrustScoreProps {
    userId: string
    className?: string
}

export async function UserTrustScore({ userId, className }: UserTrustScoreProps) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    Transaction: { where: { status: "COMPLETED" } },
                    Dispute: true,
                    Bid: true
                }
            }
        }
    })

    if (!user) return null

    // Algorithm
    let score = 50 // Base
    if (user.verificationStatus === "VERIFIED") score += 30
    if (user.emailVerified) score += 10
    if (user.phoneNumber) score += 5

    // Activity Bonus
    const txBonus = Math.min(user._count.Transaction * 2, 20) // Cap at 20
    score += txBonus

    const bidBonus = Math.min(user._count.Bid * 0.5, 10) // Cap at 10
    score += bidBonus

    // Penalties
    const disputePenalty = user._count.Dispute * 15
    score -= disputePenalty

    // Clamp
    score = Math.max(0, Math.min(100, Math.round(score)))

    // Variant
    let variant = "default"
    if (score >= 80) variant = "success"
    else if (score < 50) variant = "danger"
    else variant = "warning"

    const colorClass =
        variant === "success" ? "text-green-500 bg-green-500/10 border-green-500/20" :
            variant === "danger" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                "text-amber-500 bg-amber-500/10 border-amber-500/20"

    const Icon =
        variant === "success" ? ShieldCheck :
            variant === "danger" ? ShieldAlert :
                Shield

    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border", colorClass, className)}>
            <Icon className={cn("w-4 h-4", variant === "success" ? "fill-green-500/20" : "")} />
            <div className="flex flex-col leading-none">
                <span className="text-sm font-bold">{score}/100</span>
                <span className="text-[10px] opacity-80 font-medium">Trust Score</span>
            </div>
        </div>
    )
}
