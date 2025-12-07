"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { submitRating } from "@/app/actions/trust"
import { cn } from "@/lib/utils"

export function RatingModal({ auctionId }: { auctionId: string }) {
    const [open, setOpen] = useState(false)
    const [score, setScore] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (score === 0) return
        setIsSubmitting(true)
        try {
            await submitRating(auctionId, score, comment)
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
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    Rate Experience
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Rate Auctioneer</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        How was your experience with this auction? Your feedback helps others.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                onClick={() => setScore(value)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        value <= score ? "fill-amber-500 text-amber-500" : "text-slate-600"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Share your thoughts (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={score === 0 || isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
                        {isSubmitting ? "Submitting..." : "Submit Rating"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
