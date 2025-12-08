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
import { initiateDeposit, simulateDeposit } from "@/app/actions/payments"
import { Wallet, Smartphone, Banknote, ScanText, Loader2, Upload } from "lucide-react"
import Tesseract from "tesseract.js"

export function DepositModal() {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [method, setMethod] = useState<"ECOCASH" | "ZIPIT" | "CASH">("ECOCASH")
    const [reference, setReference] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [ocrText, setOcrText] = useState("")

    // OCR Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsScanning(true)
        try {
            const result = await Tesseract.recognize(
                file,
                'eng'
                // { logger: m => console.log(m) } // Optional logger
            )
            const text = result.data.text
            setOcrText(text)
            console.log("OCR Scanned Text:", text)

            // Intelligent Parsing Logic for EcoCash/Bank SMS
            // Common format: "Transfer Confirmation: $150.00 from..." or "Ref: MP123456"

            // 1. Extract Amount ($XX.XX)
            const amountMatch = text.match(/\$(\d+(\.\d{1,2})?)/)
            if (amountMatch && amountMatch[1]) {
                setAmount(amountMatch[1])
            }

            // 2. Extract Reference (Ref: XXXXX or just parsing capital letters/numbers if labeled)
            // Strategy: Look for "Ref:" or typical ID patterns (e.g., MP2405...)
            const refMatch = text.match(/(?:Ref:|Reference:|Txn ID:)\s*([A-Z0-9]+)/i) || text.match(/\b(MP\d{6,}[A-Z0-9]*)\b/) // EcoCash typical ID start

            if (refMatch && refMatch[1]) {
                setReference(refMatch[1])
            } else {
                // Fallback: If we found an amount but not a ref, maybe the ref is just a long alphanumeric string
                // Ideally, user manually enters if regex fails.
            }

        } catch (err) {
            console.error("OCR Failed:", err)
            alert("Could not read image. Please enter details manually.")
        } finally {
            setIsScanning(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !reference) return

        setIsSubmitting(true)
        try {
            // Construct a proof string (OCR Text excerpt or flag)
            const proof = ocrText ? `OCR Verified: ${ocrText.substring(0, 100)}...` : "Manual Entry"

            if (method === "ECOCASH") {
                // For EcoCash, we simulate instant processing for the MVP/Demo
                await new Promise(resolve => setTimeout(resolve, 2000))
                await simulateDeposit(Number(amount), "ECOCASH", reference, proof)
                alert("Payment Successful! Funds added instantly.")
            } else {
                await initiateDeposit(Number(amount), method, reference, proof)
                if (method === "ZIPIT") alert("Payment Pending. Admin will verify shortly.")
            }

            setOpen(false)
            setAmount("")
            setReference("")
            setOcrText("")
        } catch (error) {
            console.error(error)
            alert("Payment failed. Please try again.")
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
                                        EcoCash (Instant)
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

                    {/* OCR Upload Section */}
                    {method === "ECOCASH" && (
                        <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <ScanText className="w-4 h-4 text-amber-500" />
                                    Auto-Fill from Screenshot
                                </span>
                                {isScanning && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
                            </div>
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="ocr-upload"
                                    onChange={handleImageUpload}
                                    disabled={isScanning}
                                />
                                <Label
                                    htmlFor="ocr-upload"
                                    className={`flex items-center justify-center gap-2 w-full p-2 rounded cursor-pointer transition-colors border text-sm ${isScanning
                                        ? "bg-slate-800 border-slate-700 text-slate-500 cursor-wait"
                                        : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                        }`}
                                >
                                    {isScanning ? "Scanning Receipt..." : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Upload Proof of Payment
                                        </>
                                    )}
                                </Label>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Upload a screenshot of your EcoCash SMS or App confirmation. We will try to read the details automatically.
                            </p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white font-mono text-lg" // Larger font for money
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reference">
                            {method === "CASH" ? "Receipt Number" : "Transaction Reference"}
                        </Label>
                        <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white font-mono"
                            placeholder={method === "ECOCASH" ? "e.g. MP2405..." : "Enter reference"}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || isScanning} className="bg-amber-500 hover:bg-amber-600 text-white w-full">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </span>
                            ) : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
