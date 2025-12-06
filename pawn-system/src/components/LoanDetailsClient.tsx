"use client"

import { useState } from "react"
import { DollarSign, AlertTriangle } from "lucide-react"
import { PaymentModal } from "@/components/PaymentModal"
import { updateLoanStatus } from "@/app/actions/loans"

interface LoanDetailsClientProps {
    loanId: string
    remainingBalance: number
    status: string
}

export function LoanDetailsClient({ loanId, remainingBalance, status }: LoanDetailsClientProps) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleMarkDefault = async () => {
        if (!confirm("Are you sure you want to mark this loan as DEFAULTED? The item will be moved to inventory.")) return

        setIsUpdating(true)
        await updateLoanStatus(loanId, "DEFAULTED")
        setIsUpdating(false)
    }

    if (status !== "ACTIVE" && status !== "DEFAULTED") return null

    return (
        <>
            <div className="flex space-x-2">
                {status === "ACTIVE" && (
                    <button
                        onClick={handleMarkDefault}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-destructive hover:text-destructive"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {isUpdating ? "Updating..." : "Mark Default"}
                    </button>
                )}
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Add Payment
                </button>
            </div>

            <PaymentModal
                loanId={loanId}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                remainingBalance={remainingBalance}
            />
        </>
    )
}
