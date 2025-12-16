"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle } from "lucide-react"
import { CheckoutDialog } from "@/components/payments/checkout-dialog"
import { payForAuction } from "@/app/actions/auctions"
import { TransactionMethod } from "@prisma/client"

interface WonAuctionCardProps {
    auction: any // Type this better in real app
}

export function WonAuctionCard({ auction }: WonAuctionCardProps) {
    const [open, setOpen] = useState(false)

    // Calculate fees
    const price = Number(auction.currentBid)
    // Use defaults if fields missing (handled by DB default but strictly typed here)
    const levyPercent = auction.buyerLevyPercent || 15
    const vatPercent = auction.vatPercent || 15

    const levy = price * (levyPercent / 100)
    const vat = price * (vatPercent / 100)
    const total = price + levy + vat

    const isPaid = auction.Item.status === "SOLD"

    return (
        <div className="flex flex-col md:flex-row overflow-hidden border rounded-lg border-l-4 border-l-green-500 bg-card">
            <div className="p-6 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <h3 className="font-bold text-lg">{auction.Item.name}</h3>
                    {isPaid ? (
                        <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-bold">PAID</span>
                    ) : (
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">WON</span>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                        <span className="block text-muted-foreground">Winning Bid</span>
                        <span className="font-semibold">{formatCurrency(price)}</span>
                    </div>
                    <div>
                        <span className="block text-muted-foreground">Levy ({levyPercent}%)</span>
                        <span className="font-semibold">{formatCurrency(levy)}</span>
                    </div>
                    <div>
                        <span className="block text-muted-foreground">VAT ({vatPercent}%)</span>
                        <span className="font-semibold">{formatCurrency(vat)}</span>
                    </div>
                    <div className="bg-muted p-2 rounded">
                        <span className="block text-muted-foreground text-xs uppercase">Total Due</span>
                        <span className="font-bold text-lg">{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-muted/30 flex items-center justify-center md:min-w-[200px]">
                {isPaid ? (
                    <Button variant="outline" disabled>Paid & Collected</Button>
                ) : (
                    <>
                        <Button size="lg" className="w-full" onClick={() => setOpen(true)}>Pay Now</Button>
                        <CheckoutDialog
                            open={open}
                            onOpenChange={setOpen}
                            title={`Pay for ${auction.Item.name}`}
                            description={`Complete payment of ${formatCurrency(total)} (Bid + Levy + VAT)`}
                            amount={total}
                            onConfirm={async (method, ref) => {
                                // Call server action
                                return await payForAuction(auction.id, method as TransactionMethod, ref)
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}


