"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitDispute } from "@/app/actions/trust"

export function DisputeModal({ auctionId }: { auctionId: string }) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!reason || !description) return
        setIsSubmitting(true)
        try {
            await submitDispute(auctionId, reason, description)
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Report an Issue
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Please describe the issue with this auction. Our team will review it shortly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setReason}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="item_mismatch">Item not as described</SelectItem>
                            <SelectItem value="shipping_issue">Shipping/Delivery issue</SelectItem>
                            <SelectItem value="payment_issue">Payment issue</SelectItem>
                            <SelectItem value="fraud">Suspected Fraud</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        placeholder="Describe the issue in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!reason || !description || isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
