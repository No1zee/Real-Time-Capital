"use client"

import { useState, useActionState, useEffect } from "react"
import { X, Loader2, DollarSign } from "lucide-react"

import { addPayment, PaymentState } from "@/app/actions/payments"
import { useAI } from "./ai/ai-provider"

interface PaymentModalProps {
    loanId: string
    isOpen: boolean
    onClose: () => void
    remainingBalance: number
}

const initialState: PaymentState = { message: null, errors: {} }

export function PaymentModal({ loanId, isOpen, onClose, remainingBalance }: PaymentModalProps) {
    const [state, formAction, isPending] = useActionState(addPayment, initialState)
    const [amount, setAmount] = useState("")

    const { notify } = useAI()

    useEffect(() => {
        if (state.message) {
            if (state.message.includes("success")) {
                notify(state.message, undefined, undefined, "success")
                onClose()
            } else {
                notify(state.message, undefined, undefined, "error")
            }
        }
    }, [state, onClose, notify])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Record Payment</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-accent transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="loanId" value={loanId} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Amount ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                name="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`flex h-10 w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.amount ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                placeholder="0.00"
                                step="0.01"
                                max={remainingBalance}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Remaining Balance: ${remainingBalance.toFixed(2)}
                        </p>
                        {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Payment Method</label>
                        <select
                            name="method"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Transfer">Bank Transfer</option>
                            <option value="EcoCash">EcoCash</option>
                            <option value="InnBucks">InnBucks</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Reference (Optional)</label>
                        <input
                            name="reference"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="e.g. Transaction ID"
                        />
                    </div>



                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Payment"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
