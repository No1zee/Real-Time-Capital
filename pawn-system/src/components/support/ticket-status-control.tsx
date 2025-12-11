"use client"

import { useState } from "react"
import { TicketStatus } from "@prisma/client"
import { updateTicketStatus } from "@/app/actions/support"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function TicketStatusControl({ ticketId, currentStatus }: { ticketId: string, currentStatus: TicketStatus }) {
    const [loading, setLoading] = useState(false)

    async function onValueChange(value: TicketStatus) {
        setLoading(true)
        const result = await updateTicketStatus(ticketId, value)
        if (result.success) {
            toast.success("Status updated")
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select onValueChange={onValueChange} defaultValue={currentStatus} disabled={loading}>
                <SelectTrigger className="w-[140px]">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(TicketStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                            {status.replace("_", " ")}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
