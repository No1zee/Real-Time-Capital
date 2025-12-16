"use client"

import { useState } from "react"
import { createCRMTask, updateCRMTaskStatus } from "@/app/actions/admin/crm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface CRMTask {
    id: string
    title: string
    status: string
    currency?: string // Unused?
    dueDate: Date | null
    priority: string
    Assignee: {
        name: string | null
        image: string | null
    } | null
}

interface TaskBoardProps {
    userId: string
    initialTasks: CRMTask[]
}

export function TaskBoard({ userId, initialTasks }: TaskBoardProps) {
    const [tasks, setTasks] = useState<CRMTask[]>(initialTasks)
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [date, setDate] = useState<Date>()
    const [isCreating, setIsCreating] = useState(false)

    const handleCreate = async () => {
        if (!newTaskTitle.trim()) return
        setIsCreating(true)
        try {
            await createCRMTask(userId, newTaskTitle, undefined, date)
            window.location.reload()
        } catch (e) {
            console.error(e)
        } finally {
            setIsCreating(false)
            setNewTaskTitle("")
        }
    }

    const toggleStatus = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED"

        // Optimistic
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

        try {
            await updateCRMTaskStatus(taskId, newStatus, userId)
        } catch (e) {
            // Revert
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: currentStatus } : t))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 items-center p-4 bg-muted/30 rounded-lg border border-dashed">
                <Input
                    placeholder="New task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-transparent border-none shadow-none focus-visible:ring-0"
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn(date && "text-primary")}>
                            <CalendarIcon className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button size="sm" onClick={handleCreate} disabled={!newTaskTitle.trim() || isCreating}>
                    {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        task.status === "COMPLETED" ? "bg-muted/50 opacity-60" : "bg-card hover:bg-muted/20"
                    )}>
                        <Checkbox
                            checked={task.status === "COMPLETED"}
                            onCheckedChange={() => toggleStatus(task.id, task.status)}
                        />
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium truncate", task.status === "COMPLETED" && "line-through")}>
                                {task.title}
                            </p>
                            {task.dueDate && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {format(new Date(task.dueDate), "MMM d")}
                                </p>
                            )}
                        </div>
                        {task.Assignee && (
                            <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                                {task.Assignee.name?.split(' ')[0]}
                            </div>
                        )}
                        <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"} className="text-[10px]">
                            {task.priority}
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    )
}
