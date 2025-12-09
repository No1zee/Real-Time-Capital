"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/PaymentModal"
import { DollarSign, CalendarClock, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface LoanActionsProps {
    loanId: string
    remainingBalance: number
    status: string
}

export function LoanActions({ loanId, remainingBalance, status }: LoanActionsProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [isExtensionLoading, setIsExtensionLoading] = useState(false)

    const handleExtensionRequest = async () => {
        setIsExtensionLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsExtensionLoading(false)
        toast.success("Extension request sent to admin for review.")
    }

    if (status !== "ACTIVE") return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20"
                size="lg"
            >
                <CreditCard className="w-4 h-4 mr-2" />
                Make Payment
            </Button>

            <Button
                variant="outline"
                onClick={handleExtensionRequest}
                disabled={isExtensionLoading}
                className="w-full border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30"
                size="lg"
            >
                <CalendarClock className="w-4 h-4 mr-2 text-amber-500" />
                {isExtensionLoading ? "Requesting..." : "Request Extension"}
            </Button>

            <PaymentModal
                loanId={loanId}
                remainingBalance={remainingBalance}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
            />
        </div>
    )
}
