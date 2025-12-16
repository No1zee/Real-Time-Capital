"use client"

import { useState } from "react"
import { addCRMNote } from "@/app/actions/admin/crm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send } from "lucide-react"

interface CRMNote {
    id: string
    content: string
    createdAt: Date
    Author: {
        name: string | null
        image: string | null
        role: string
    }
}

interface NoteTimelineProps {
    userId: string
    initialNotes: CRMNote[]
}

export function NoteTimeline({ userId, initialNotes }: NoteTimelineProps) {
    const [notes, setNotes] = useState<CRMNote[]>(initialNotes)
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            // Optimistic update could go here, but let's wait for author info return
            const newNote = await addCRMNote(userId, content)

            // We need the author info to display immediately. 
            // In a real app we'd optimistic update with current user session, 
            // but for now let's just refresh or append if the action returned enough data.
            // The action determines Author ID but doesn't return the relation unless included.
            // Let's simpler: Just reload page or rely on revalidatePath to update server component?
            // "revalidatePath" in the action updates the server component view.
            // But this is a CLIENT component state.
            // We should use router.refresh() or just append a mock note if we trust it.

            // Re-fetch or append? Let's just append with "You" for instant feedback
            // Actually, easier: router.refresh() 
            // But let's just cheat and reload specifically or structure the state.
            window.location.reload() // Brute force for prototype speed, ideally use router.refresh()

        } catch (error) {
            console.error("Failed to add note", error)
        } finally {
            setIsSubmitting(false)
            setContent("")
        }
    }

    return (
        <div className="space-y-6">
            {/* Input */}
            <div className="flex gap-4">
                <Textarea
                    placeholder="Add a private note..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Post Note
                </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                {notes.map((note) => (
                    <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon/Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:static">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={note.Author.image || undefined} />
                                <AvatarFallback>{note.Author.name?.[0] || "A"}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ml-14 md:ml-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm">{note.Author.name || "Unknown Staff"}</span>
                                <time className="font-mono text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</time>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                {note.content}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {note.Author.role}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
