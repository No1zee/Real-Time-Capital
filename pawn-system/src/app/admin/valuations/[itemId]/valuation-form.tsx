"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { submitValuation } from "@/app/actions/admin/valuation"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // Assuming we have sonner or just use alert
// Note: If sonner not installed, fallback to alert or simple logic. 
// I'll use simple logic for now.

interface ValuationFormProps {
    itemId: string
    clientEstimate: number
}

export default function ValuationForm({ itemId, clientEstimate }: ValuationFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [officialValuation, setOfficialValuation] = useState<string>("")
    const [loanOffer, setLoanOffer] = useState<string>("")

    const handleAutoCalculate = () => {
        const val = Number(officialValuation)
        if (!isNaN(val)) {
            setLoanOffer((val * 0.5).toFixed(2)) // 50% LTV Default
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await submitValuation(itemId, Number(officialValuation), Number(loanOffer))
            if (result.success) {
                // Show success
                router.push("/admin/valuations")
                router.refresh()
            } else {
                alert("Error: " + result.message)
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="border-amber-200 dark:border-amber-900 shadow-lg">
            <CardHeader className="bg-amber-50 dark:bg-amber-950/30 pb-4">
                <CardTitle className="text-amber-800 dark:text-amber-500">Official Appraisal</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm mb-4">
                    <span className="text-muted-foreground mr-2">Client's Estimate:</span>
                    <span className="font-bold">${clientEstimate.toLocaleString()}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Assessed Value ($)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={officialValuation}
                            onChange={(e) => setOfficialValuation(e.target.value)}
                            onBlur={handleAutoCalculate} // Auto-calc offer on blur
                            required
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Max Loan Offer ($)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={loanOffer}
                                onChange={(e) => setLoanOffer(e.target.value)}
                                required
                                className="text-lg font-bold text-green-600"
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                                {officialValuation && loanOffer ? `${((Number(loanOffer) / Number(officialValuation)) * 100).toFixed(0)}% LTV` : ""}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recommended LTV is 50-60% for Art/Jewelry.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Send Offer"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 text-xs text-muted-foreground p-4">
                Submitting this will update the loan status to APPROVED and notify the client (mock).
            </CardFooter>
        </Card>
    )
}
