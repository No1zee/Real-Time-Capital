"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { SellItemModal } from "@/components/SellItemModal"

interface InventoryActionsProps {
    item: {
        id: string
        name: string
        valuation: number
        status: string
    }
}

export function InventoryActions({ item }: InventoryActionsProps) {
    const [isSellModalOpen, setIsSellModalOpen] = useState(false)

    if (item.status !== "IN_AUCTION") return null

    return (
        <>
            <button
                onClick={() => setIsSellModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-1"
            >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Sell
            </button>

            <SellItemModal
                item={item}
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
            />
        </>
    )
}
