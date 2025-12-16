"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { askQuestion } from "@/app/actions/questions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface QuestionSectionProps {
    auctionId: string
    questions: any[]
    isSellerOrAdmin: boolean
}

export function QuestionSection({ auctionId, questions, isSellerOrAdmin }: QuestionSectionProps) {
    const [questionText, setQuestionText] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAsk = async () => {
        if (!questionText.trim()) return
        setLoading(true)
        const result = await askQuestion(auctionId, questionText)
        if (result.success) {
            toast.success(result.message)
            setQuestionText("")
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 mt-8">
            <h3 className="text-xl font-bold">Questions & Answers</h3>

            {/* Ask Form */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                <Textarea
                    placeholder="Ask the seller a question..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button onClick={handleAsk} disabled={loading || !questionText.trim()}>
                        {loading ? "Posting..." : "Ask Question"}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {questions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No questions yet. Be the first to ask!</p>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-sm">{q.User.name || "User"} asked:</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm">{q.text}</p>

                                    {q.answer && (
                                        <div className="bg-muted p-3 rounded-md mt-2 ml-4 border-l-2 border-primary">
                                            <p className="text-xs font-bold text-primary mb-1">Seller Answer:</p>
                                            <p className="text-sm">{q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
