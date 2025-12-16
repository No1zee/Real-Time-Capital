"use client"

import { useRef, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SenderType } from "@prisma/client"
import { sendMessage } from "@/app/actions/support"
import { formatDistanceToNow } from "date-fns"
import { Send } from "lucide-react"
import { useAI } from "@/components/ai/ai-provider"

type Message = {
    id: string
    message: string
    sender: SenderType
    timestamp: Date
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button size="icon" type="submit" disabled={pending}>
            <Send className="h-4 w-4" />
        </Button>
    )
}

export function ChatInterface({ ticketId, messages, userId }: { ticketId: string, messages: Message[], userId: string }) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const { notify } = useAI()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function action(formData: FormData) {
        const message = formData.get("message") as string
        if (!message.trim()) return

        const result = await sendMessage(ticketId, message)
        if (result.success) {
            formRef.current?.reset()
        } else {
            notify(result.message || "Failed to send message", undefined, undefined, "error")
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-background">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender === "USER"
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                        {isMe ? "ME" : "SP"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div
                                        className={`p-3 rounded-lg text-sm ${isMe
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                            }`}
                                    >
                                        {msg.message}
                                    </div>
                                    <p className={`text-[10px] text-muted-foreground mt-1 ${isMe ? "text-right" : "text-left"}`}>
                                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-muted/20">
                <form ref={formRef} action={action} className="flex gap-2">
                    <Textarea
                        name="message"
                        placeholder="Type your message..."
                        className="min-h-[2.5rem] max-h-32 resize-none flex-1"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                e.currentTarget.form?.requestSubmit()
                            }
                        }}
                    />
                    <SubmitButton />
                </form>
            </div>
        </div>
    )
}
