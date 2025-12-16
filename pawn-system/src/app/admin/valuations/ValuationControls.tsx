"use client"

import { useState } from "react"
import { updateValuation } from "@/app/actions/valuation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, DollarSign, Send } from "lucide-react"
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
    }
}

export function ValuationControls({ item }: ValuationControlsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [amount, setAmount] = useState<string>("")
    const { notify } = useAI()

    const isMarketEval = item.valuationStatus === "PENDING_MARKET_EVAL" || item.valuationStatus === "PENDING_VALUATION"
    const isFinalOffer = item.valuationStatus === "PENDING_FINAL_OFFER"
    const isComplete = item.valuationStatus === "OFFER_READY" || item.valuationStatus === "OFFER_ACCEPTED"

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount))) {
            notify("Please enter a valid amount", undefined, undefined, "error")
            return
        }

        setIsLoading(true)
        try {
            const type = isEditing ? "final-offer" : (isMarketEval ? "market-value" : "final-offer")
            const result = await updateValuation(item.id, Number(amount), type)

            if (result.success) {
                notify(isMarketEval ? "Market value updated" : "Final offer sent", undefined, undefined, "success")
                setAmount("")
                router.refresh()
            } else {
                notify(result.error || "Failed to update valuation", undefined, undefined, "error")
            }
        } catch (error) {
            notify("An error occurred", undefined, undefined, "error")
        } finally {
            setIsLoading(false)
        }
    }

    const [isEditing, setIsEditing] = useState(false)

    // Helper to switch modes
    const enableEdit = () => {
        setAmount(item.finalValuation?.toString() || "")
        setIsEditing(true)
    }

    if (isComplete && !isEditing) {
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
                <Button variant="outline" className="w-full text-xs" onClick={enableEdit}>
                    Update / Re-assess Value
                </Button>
            </div>
        )
    }

    if (!isMarketEval && !isFinalOffer && !isEditing) {
        // Fallback for random statuses: Allow initiating valuation
        return (
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg">Valuation Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Current Status: {item.valuationStatus || "None"}</p>
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                        Assess Value Manually
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const activeMode = isEditing ? "final-offer" : (isMarketEval ? "market-value" : "final-offer")

    return (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    {isEditing ? "Update Valuation" : (isMarketEval ? "Step 1: Market Evaluation" : "Step 2: Final Loan Offer")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isMarketEval && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded border">
                        <span className="font-medium">User Estimate:</span> ${item.userEstimatedValue?.toFixed(2) || "0.00"}
                    </div>
                )}

                {/* Show Market Value context if we are in Final Offer mode (or editing) */}
                {(isFinalOffer || isEditing) && !isMarketEval && (
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
                    {isEditing && (
                        <p className="text-xs text-amber-600 font-medium">
                            Warning: Updating this will override the current offer.
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                {isEditing && (
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-1/3">Cancel</Button>
                )}
                <Button
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleSubmit}
                    disabled={isLoading || !amount}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Update Offer" : (isMarketEval ? "Save Market Value & Continue" : "Submit Final Offer")}
                </Button>
            </CardFooter>
        </Card>
    )
}
