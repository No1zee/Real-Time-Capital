"use client"

import { useState } from "react"
import { updateValuation } from "@/app/actions/valuation" // Keeping for Market Value update
import { submitValuation, approveValuation, rejectValuation } from "@/app/actions/admin/valuation" // New Maker Checker actions
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, DollarSign, Send, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAI } from "@/components/ai/ai-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ValuationControlsProps {
    item: {
        id: string
        valuationStatus: string
        marketValue: number | null
        finalValuation: number | null
        userEstimatedValue: number | null
        makerId?: string | null
        rejectionReason?: string | null
    }
    currentUserId: string
}

export function ValuationControls({ item, currentUserId }: ValuationControlsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [amount, setAmount] = useState<string>("")
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectInput, setShowRejectInput] = useState(false)
    const { notify } = useAI()

    const isMarketEval = item.valuationStatus === "PENDING_MARKET_EVAL" || item.valuationStatus === "PENDING_VALUATION"
    const isPendingApproval = item.valuationStatus === "PENDING_APPROVAL"
    const isRejected = item.valuationStatus === "REJECTED_BY_CHECKER"

    // If it was rejected, we treat it like "Final Offer" stage but with a warning, or reset to Market Eval?
    // Let's assume we are re-submitting the proposed offer.
    const isResubmitting = isRejected
    const isFinalOffer = item.valuationStatus === "PENDING_FINAL_OFFER" || isResubmitting

    const isComplete = item.valuationStatus === "OFFER_READY" || item.valuationStatus === "OFFER_ACCEPTED"

    // Handlers
    const handleMarketValueSubmit = async () => {
        if (!amount || isNaN(Number(amount))) {
            notify("Please enter a valid amount", undefined, undefined, "error")
            return
        }
        setIsLoading(true)
        try {
            const result = await updateValuation(item.id, Number(amount), "market-value")
            if (result.success) {
                notify("Market value updated", undefined, undefined, "success")
                setAmount("")
                router.refresh()
            } else {
                notify(result.error || "Failed", undefined, undefined, "error")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleProposeOffer = async () => {
        if (!amount || isNaN(Number(amount))) {
            notify("Please enter a valid amount", undefined, undefined, "error")
            return
        }
        setIsLoading(true)
        try {
            // We use submitValuation from admin/valuation.ts logic
            const marketVal = item.marketValue || 0
            const result = await submitValuation(item.id, marketVal, Number(amount))

            if (result.success) {
                notify("Valuation submitted for approval", undefined, undefined, "success")
                setAmount("")
                router.refresh()
            } else {
                notify(result.message || "Failed", undefined, undefined, "error")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            const result = await approveValuation(item.id)
            if (result.success) {
                notify("Valuation approved", undefined, undefined, "success")
                router.refresh()
            } else {
                notify(result.message || "Approval failed", undefined, undefined, "error")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason) {
            notify("Please provide a reason", undefined, undefined, "error")
            return
        }
        setIsLoading(true)
        try {
            const result = await rejectValuation(item.id, rejectReason)
            if (result.success) {
                notify("Valuation rejected", undefined, undefined, "success")
                setShowRejectInput(false)
                router.refresh()
            } else {
                notify(result.message || "Rejection failed", undefined, undefined, "error")
            }
        } finally {
            setIsLoading(false)
        }
    }

    // --- RENDER LOGIC ---

    // 1. COMPLETED STATE
    if (isComplete) {
        return (
            <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900">
                    <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-400">Valuation Complete</AlertTitle>
                    </div>
                    <AlertDescription className="text-green-700 dark:text-green-500 mt-2">
                        Evaluation process is finished. Final offer of <span className="font-bold">${item.finalValuation?.toFixed(2)}</span> is ready for customer review.
                    </AlertDescription>
                </Alert>
                {/* Re-assess logic could be complex with Maker Checker, disabling for now or could require full cycle reset */}
            </div>
        )
    }

    // 2. WAITING FOR APPROVAL (Maker View)
    if (isPendingApproval && item.makerId === currentUserId) {
        return (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900">
                <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-400">Pending Approval</AlertTitle>
                </div>
                <AlertDescription className="text-blue-700 dark:text-blue-500 mt-2">
                    You have submitted a proposed offer of <strong>${item.finalValuation?.toFixed(2)}</strong>.
                    <br />
                    A different administrator must review and approve this before it is sent to the customer.
                </AlertDescription>
            </Alert>
        )
    }

    // 3. APPROVAL REQUIRED (Checker View)
    if (isPendingApproval && item.makerId !== currentUserId) {
        return (
            <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/10">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        Review Valuation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded border">
                        <span className="font-medium block mb-1">Proposed Offer</span>
                        <span className="text-xl font-bold text-indigo-600">${item.finalValuation?.toFixed(2)}</span>
                        <div className="mt-2 text-xs text-slate-500">
                            Market Value Estimate: ${item.marketValue?.toFixed(2)}
                            <br />
                            Maker ID: {item.makerId?.substring(0, 8)}
                        </div>
                    </div>

                    {showRejectInput && (
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                placeholder="Why is this valuation being rejected?"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    {showRejectInput ? (
                        <>
                            <Button variant="ghost" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Reject
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="destructive" onClick={() => setShowRejectInput(true)} disabled={isLoading} className="flex-1">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleApprove} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        )
    }

    // 4. REJECTED STATE (Edit/Retry)
    if (isRejected) {
        // Show the rejection alert but allow editing
    }

    // 5. NORMAL FLOW (Market Eval or Final Offer)
    const activeMode = isMarketEval ? "market-value" : "final-offer"

    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    {isRejected ? "Resubmit Valuation" : (isMarketEval ? "Step 1: Market Evaluation" : "Step 2: Propose Final Offer")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isRejected && (
                    <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Valuation Rejected</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                            Reason: {item.rejectionReason}
                            <br />
                            Please adjust the offer and resubmit.
                        </AlertDescription>
                    </Alert>
                )}

                {isMarketEval && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded border">
                        <span className="font-medium">User Estimate:</span> ${item.userEstimatedValue?.toFixed(2) || "0.00"}
                    </div>
                )}

                {(isFinalOffer || isRejected) && !isMarketEval && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded border space-y-1">
                        <div className="flex justify-between">
                            <span>User Estimate:</span>
                            <span className="font-medium">${item.userEstimatedValue?.toFixed(2) || "0.00"}</span>
                        </div>
                        {item.marketValue && (
                            <div className="flex justify-between text-amber-600 font-bold">
                                <span>Market Value:</span>
                                <span>${item.marketValue?.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="amount">
                        {isMarketEval ? "Enter Assessed Market Value ($)" : "Enter Final Loan Amount ($)"}
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-7 bg-white dark:bg-slate-950"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={isMarketEval ? handleMarketValueSubmit : handleProposeOffer}
                    disabled={isLoading || !amount}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isMarketEval ? "Save Market Value & Continue" : "Submit Proposal"}
                </Button>
            </CardFooter>
        </Card>
    )
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
