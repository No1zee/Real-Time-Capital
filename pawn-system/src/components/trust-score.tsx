import { Star } from "lucide-react"
import { getAverageRating } from "@/app/actions/trust"

export async function TrustScore() {
    const rating = await getAverageRating()

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-500">{rating}</span>
            <span className="text-xs text-amber-500/70">Trust Score</span>
        </div>
    )
}
