"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { initiateDeposit } from "@/app/actions/payments"
import { Wallet, Smartphone, Banknote } from "lucide-react"

export function DepositModal() {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [method, setMethod] = useState<"ECOCASH" | "ZIPIT" | "CASH">("ECOCASH")
    const [reference, setReference] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !reference) return

        setIsSubmitting(true)
        try {
            await initiateDeposit(Number(amount), method, reference)
            setOpen(false)
            setAmount("")
            setReference("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                    <Wallet className="w-4 h-4" />
                    Top Up Wallet
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Top Up Wallet</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Select a payment method and enter the transaction details.
                        Funds will be credited after admin verification.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="ECOCASH">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-blue-400" />
                                        EcoCash
                                    </div>
                                </SelectItem>
                                <SelectItem value="ZIPIT">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-green-400" />
                                        Zipit / Bank Transfer
                                    </div>
                                </SelectItem>
                                <SelectItem value="CASH">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-amber-400" />
                                        Cash (In-Store)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {method === "ECOCASH" && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                            <p className="font-bold mb-1">Instructions:</p>
                            <p>1. Dial *151*...</p>
                            <p>2. Send to Merchant Code: <span className="font-mono font-bold">123456</span></p>
                            <p>3. Enter Amount and Reference below.</p>
                        </div>
                    )}

                    {method === "ZIPIT" && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-200">
                            <p className="font-bold mb-1">Bank Details:</p>
                            <p>Bank: <span className="font-bold">CABS</span></p>
                            <p>Account: <span className="font-mono font-bold">1001234567</span></p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white"
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reference">
                            {method === "CASH" ? "Receipt Number / Note" : "Transaction Reference"}
                        </Label>
                        <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white"
                            placeholder={method === "ECOCASH" ? "e.g. MP2105..." : "Enter reference"}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white w-full">
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
