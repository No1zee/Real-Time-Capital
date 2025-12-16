"use client"

import { useAI } from "@/components/ai/ai-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Trash2, RefreshCw, Clock, History } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface AIHistoryPanelProps {
    isOpen: boolean
    onClose: () => void
}

import { Input } from "@/components/ui/input"
import { Send, User } from "lucide-react"
import { askAI } from "@/app/actions/ai-chat"
import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"

interface AIHistoryPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function AIHistoryPanel({ isOpen, onClose }: AIHistoryPanelProps) {
    const { history, clearHistory, resetDismissed, triggerAction, notify } = useAI()
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    // History is usually newest-first (based on provider). For chat, we usually want oldest-first (bottom).
    // But our history includes system alerts which are timeline based.
    // Let's keep it simplest: Reverse the list for rendering so newest is at BOTTOM.
    const sortedHistory = [...history].reverse()

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [history, isTyping, isOpen]) // Scroll when opening too

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput("")

        // 1. Add User Message
        notify(userMsg, undefined, undefined, "default", `user-${Date.now()}`, "USER_MESSAGE")
        setIsTyping(true)

        // 2. Call Server Action
        try {
            const response = await askAI(userMsg, { path: pathname })
            notify(response.message, undefined, undefined, "default", `ai-${Date.now()}`, "AI_RESPONSE")
        } catch (e) {
            notify("Sorry, I had trouble connecting to my brain.", undefined, undefined, "error", `err-${Date.now()}`, "AI_RESPONSE")
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b bg-muted/40">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle>AI Assistant</SheetTitle>
                            <SheetDescription>Chat & Notification History</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Controls Header */}
                    <div className="flex items-center justify-between p-2 px-4 border-b bg-background/50 backdrop-blur-sm z-10">
                        <span className="text-xs text-muted-foreground">Context: Standard</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetDismissed} title="Reset Tips">
                                <RefreshCw className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearHistory} title="Clear Log">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4 flex flex-col justify-end min-h-full">
                            {sortedHistory.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-2 opacity-50">
                                    <Bot className="w-12 h-12 stroke-1" />
                                    <p>I'm ready to help.</p>
                                </div>
                            ) : (
                                sortedHistory.map((item, i) => {
                                    const isUser = item.type === "USER_MESSAGE"
                                    const isSystem = item.type === "SYSTEM_NOTIFICATION" || item.type === "OFFER_TIP" || item.type === "SUGGEST_TOUR" || item.type === "SUGGEST_DEMO"

                                    if (isUser) {
                                        return (
                                            <div key={item.id} className="flex justify-end animate-in slide-in-from-right-2 fade-in duration-300">
                                                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-sm">
                                                    {item.message}
                                                </div>
                                            </div>
                                        )
                                    }

                                    if (item.type === "AI_RESPONSE") {
                                        return (
                                            <div key={item.id} className="flex justify-start gap-3 animate-in slide-in-from-left-2 fade-in duration-300">
                                                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%] text-sm text-foreground shadow-sm">
                                                    {item.message}
                                                </div>
                                            </div>
                                        )
                                    }

                                    // System Messages (Cards)
                                    return (
                                        <div key={item.id} className="flex justify-center animate-in fade-in duration-500 my-2">
                                            <div className="bg-card border px-4 py-3 rounded-xl max-w-[95%] text-xs text-muted-foreground shadow-sm w-full flex gap-3 items-start">
                                                <div className={cn(
                                                    "mt-0.5 w-1.5 h-1.5 rounded-full ring-2 ring-offset-1 shrink-0",
                                                    item.variant === "warning" ? "bg-amber-500 ring-amber-500/20" :
                                                        item.variant === "error" ? "bg-red-500 ring-red-500/20" : "bg-blue-500 ring-blue-500/20"
                                                )} />
                                                <div className="flex-1 space-y-2">
                                                    <p>{item.message}</p>
                                                    {item.actionLabel && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 text-xs w-full"
                                                            onClick={() => triggerAction(item)}
                                                        >
                                                            {item.actionLabel}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}

                            {isTyping && (
                                <div className="flex justify-start gap-3 animate-in fade-in duration-300">
                                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-4 bg-background border-t">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
