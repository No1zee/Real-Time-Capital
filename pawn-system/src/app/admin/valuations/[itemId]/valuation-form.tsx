"use client"

import { useState } from "react"
import { updateValuation } from "@/app/actions/valuation"
import { createLoanOffer } from "@/app/actions/loan"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign, Calendar, Percent } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface ValuationFormProps {
    itemId: string
}

export function ValuationForm({ itemId }: ValuationFormProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [createOffer, setCreateOffer] = useState(false)

    // State for inputs to auto-calculate default offer
    const [valuation, setValuation] = useState<number>(0)

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        const amount = Number(formData.get("amount"))

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid valuation amount")
            setIsPending(false)
            return
        }

        try {
            // 1. Update Valuation First (Always)
            const valResult = await updateValuation(itemId, amount)
            if (!valResult.success) {
                throw new Error("Failed to update valuation")
            }

            // 2. If Offer requested, Create Loan Offer
            if (createOffer) {
                const loanAmount = Number(formData.get("loanAmount"))
                const rate = Number(formData.get("rate"))
                const duration = Number(formData.get("duration"))

                const offerResult = await createLoanOffer(itemId, loanAmount, rate, duration)
                if (!offerResult.success) {
                    throw new Error("Valuation saved, but failed to create loan offer")
                }
                toast.success("Valuation set and Loan Offer created!")
            } else {
                toast.success("Valuation submitted successfully")
            }

            router.push("/admin/valuations")
        } catch (error: any) {
            toast.error(error.message || "An error occurred")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="amount">Fair Market Value ($)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        className="pl-9 text-lg font-bold"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        onChange={(e) => setValuation(Number(e.target.value))}
                    />
                </div>
                <p className="text-xs text-muted-foreground">The estimated resale value of the item.</p>
            </div>

            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <Checkbox
                    id="createOffer"
                    checked={createOffer}
                    onCheckedChange={(c) => setCreateOffer(c as boolean)}
                />
                <Label htmlFor="createOffer" className="font-semibold cursor-pointer">
                    Create Loan Offer Now
                </Label>
            </div>

            {createOffer && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Loan Principal ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                    <Input
                                        name="loanAmount"
                                        type="number"
                                        className="pl-7 bg-background"
                                        defaultValue={(valuation * 0.5).toFixed(2)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                    <Input
                                        name="rate"
                                        type="number"
                                        className="pl-7 bg-background"
                                        defaultValue="10"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (Days)</Label>
                            <div className="relative">
                                <Calendar className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                <Input
                                    name="duration"
                                    type="number"
                                    className="pl-7 bg-background"
                                    defaultValue="30"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (createOffer ? "Submit Valuation & Offer" : "Submit Valuation Only")}
            </Button>
        </form>
    )
}
