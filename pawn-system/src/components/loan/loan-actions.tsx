"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/PaymentModal"
import { DollarSign, CalendarClock, CreditCard, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { acceptLoanOffer } from "@/app/actions/loans"

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

    const handleAcceptOffer = async () => {
        setIsExtensionLoading(true) // Reuse loading state for simplicity or add new one
        try {
            const result = await acceptLoanOffer(loanId)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Failed to accept offer")
        } finally {
            setIsExtensionLoading(false)
        }
    }

    if (status === "APPROVED") {
        return (
            <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center mb-2">
                        <CalendarClock className="w-4 h-4 mr-2" />
                        Next Step: Item Handover
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your application is approved! Please bring your item to our branch for final valuation and safe storage.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                        Once inspected, click below to accept the loan.
                    </p>
                </div>

                <Button
                    onClick={handleAcceptOffer}
                    disabled={isExtensionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                    size="lg"
                >
                    {isExtensionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    I've Deposited Item & Accept Offer
                </Button>
            </div>
        )
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
