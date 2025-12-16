"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle2, XCircle, CreditCard, Banknote, Smartphone } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { TransactionMethod } from "@prisma/client"
import { useAI } from "@/components/ai/ai-provider"

interface CheckoutDialogProps {
    title: string
    description: string
    amount: number
    onConfirm: (method: TransactionMethod, reference: string) => Promise<{ success: boolean, message: string }>
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CheckoutDialog({ title, description, amount, onConfirm, trigger, open, onOpenChange }: CheckoutDialogProps) {
    const [method, setMethod] = useState<TransactionMethod>("ECOCASH")
    const [reference, setReference] = useState("") // Phone number or internal ref
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<"SUCCESS" | "ERROR" | null>(null)
    const { notify } = useAI()

    async function handlePayment() {
        setLoading(true)
        setResult(null)
        try {
            const res = await onConfirm(method, reference)
            if (res.success) {
                setResult("SUCCESS")
                notify("Transaction Completed", undefined, undefined, "success")
            } else {
                setResult("ERROR")
                notify(res.message, undefined, undefined, "error")
            }
        } catch (e) {
            setResult("ERROR")
            notify("An unexpected error occurred", undefined, undefined, "error")
        }
        setLoading(false)
    }

    const reset = () => {
        setResult(null)
        setLoading(false)
        setReference("")
        onOpenChange?.(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {result === "SUCCESS" ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in" />
                        <h3 className="text-xl font-bold">Payment Successful</h3>
                        <p className="text-center text-muted-foreground">
                            You have successfully paid {formatCurrency(amount)}.
                        </p>
                        <Button className="w-full" onClick={reset}>Done</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                            <span className="font-medium">Total Amount</span>
                            <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
                        </div>

                        <Tabs defaultValue="ECOCASH" onValueChange={(v) => setMethod(v as TransactionMethod)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="ECOCASH">Ecocash</TabsTrigger>
                                <TabsTrigger value="CASH">Cash</TabsTrigger>
                                <TabsTrigger value="ZIPIT">ZIPIT / Bank</TabsTrigger>
                            </TabsList>

                            <div className="mt-4 space-y-4">
                                {method === "ECOCASH" && (
                                    <div className="space-y-2">
                                        <Label>Ecocash Number</Label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="077..."
                                                className="pl-8"
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">You will receive a USSD prompt on this number.</p>
                                    </div>
                                )}

                                {method === "CASH" && (
                                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-2 border-2 border-dashed rounded-lg">
                                        <Banknote className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm">Please hand cash to the cashier.</p>
                                        <p className="text-xs text-muted-foreground">Reference will be generated automatically.</p>
                                    </div>
                                )}

                                {method === "ZIPIT" && (
                                    <div className="space-y-2">
                                        <Label>Proof of Payment / ZIPIT Ref</Label>
                                        <Input
                                            placeholder="BP..."
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </Tabs>

                        {result === "ERROR" && (
                            <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                                <XCircle className="h-4 w-4" />
                                <span>Transaction failed. Please try again.</span>
                            </div>
                        )}

                        <Button className="w-full" onClick={handlePayment} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay Now"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
