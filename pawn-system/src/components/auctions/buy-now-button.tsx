"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { buyItem } from "@/app/actions/auctions"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BuyNowButtonProps {
    auctionId: string
    price: number
    className?: string
}

export function BuyNowButton({ auctionId, price, className }: BuyNowButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault() // prevent navigating if inside a link card, though button inside link is bad html
        e.stopPropagation()

        if (!confirm(`Are you sure you want to buy this item for ${formatCurrency(price)} immediately?`)) return

        setLoading(true)
        const result = await buyItem(auctionId)

        if (result.success) {
            toast.success(result.message)
            // Redirect to My Bids for payment?
            window.location.href = "/portal/auctions/my-bids"
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <Button
            onClick={handleBuyNow}
            disabled={loading}
            className={className}
            variant="default"
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now {formatCurrency(price)}
        </Button>
    )
}
