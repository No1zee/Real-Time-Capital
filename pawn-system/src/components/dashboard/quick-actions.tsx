"use client"

import { Button } from "@/components/ui/button"
import { Banknote, CreditCard, Gavel, Plus, Wallet } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/portal/pawn" className="w-full">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">Get Valuation</span>
                </Button>
            </Link>

            <Link href="/portal/wallet" className="w-full">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-500 transition-all group">
                    <div className="p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <Wallet className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">Top Up Wallet</span>
                </Button>
            </Link>

            <Link href="/portal/loans" className="w-full">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-500 transition-all group">
                    <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">Make Payment</span>
                </Button>
            </Link>

            <Link href="/portal/auctions" className="w-full">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-500 transition-all group">
                    <div className="p-2 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                        <Gavel className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="font-semibold text-xs md:text-sm">Bid Now</span>
                </Button>
            </Link>
        </div>
    )
}
