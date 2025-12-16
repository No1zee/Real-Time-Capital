"use client"

import { useState, useActionState, useEffect } from "react"
import { X, Loader2, DollarSign } from "lucide-react"
import { markItemAsSold, InventoryState } from "@/app/actions/inventory"
import { useAI } from "./ai/ai-provider"

interface SellItemModalProps {
    item: {
        id: string
        name: string
        valuation: number
    }
    isOpen: boolean
    onClose: () => void
}

const initialState: InventoryState = { message: null, errors: {} }

export function SellItemModal({ item, isOpen, onClose }: SellItemModalProps) {
    const [state, formAction, isPending] = useActionState(markItemAsSold, initialState)
    const [price, setPrice] = useState("")

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
                    <h3 className="text-lg font-semibold">Sell Item</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-accent transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Original Valuation: ${Number(item.valuation).toFixed(2)}</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="itemId" value={item.id} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Sale Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                name="salePrice"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className={`flex h-10 w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.salePrice ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        {state.errors?.salePrice && <p className="text-sm text-destructive">{state.errors.salePrice}</p>}
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
                                "Confirm Sale"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
