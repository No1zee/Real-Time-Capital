"use client"

import { useActionState } from "react"
import { updateValuation } from "@/app/actions/valuation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ValuationFormProps {
    itemId: string
}

export function ValuationForm({ itemId }: ValuationFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useState(false) // Using simple transition for now as action returns object not redirect

    const handleSubmit = async (formData: FormData) => {
        const amount = Number(formData.get("amount"))
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        const result = await updateValuation(itemId, amount)
        if (result.success) {
            toast.success("Valuation submitted successfully")
            router.push("/admin/valuations")
        } else {
            toast.error(result.error || "Failed to submit")
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Assessed Value ($)</Label>
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
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                Approve Valuation
            </Button>
        </form>
    )
}

import { useState } from "react"
