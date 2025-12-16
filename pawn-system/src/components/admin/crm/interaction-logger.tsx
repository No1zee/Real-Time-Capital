"use client"

import { useState } from "react"
import { logInteraction } from "@/app/actions/admin/crm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, Users, FileText, Check } from "lucide-react"

interface InteractionLoggerProps {
    userId: string
}

export function InteractionLogger({ userId }: InteractionLoggerProps) {
    const [type, setType] = useState("CALL")
    const [summary, setSummary] = useState("")
    const [isLogged, setIsLogged] = useState(false)

    const handleLog = async () => {
        if (!summary) return

        await logInteraction(userId, type, summary)
        setIsLogged(true)
        setSummary("")
        setTimeout(() => setIsLogged(false), 2000)
    }

    return (
        <div className="flex gap-2 items-center bg-card p-2 rounded-lg border shadow-sm">
            <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="CALL"><div className="flex items-center gap-2"><Phone className="w-3 h-3" /> Call</div></SelectItem>
                    <SelectItem value="EMAIL"><div className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email</div></SelectItem>
                    <SelectItem value="MEETING"><div className="flex items-center gap-2"><Users className="w-3 h-3" /> Meet</div></SelectItem>
                    <SelectItem value="NOTE_LOG"><div className="flex items-center gap-2"><FileText className="w-3 h-3" /> Note</div></SelectItem>
                </SelectContent>
            </Select>

            <Input
                placeholder="Log outcome (e.g. Left voicemail)..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
            />

            <Button size="sm" className="h-8 px-3" onClick={handleLog} disabled={!summary}>
                {isLogged ? <Check className="w-4 h-4 text-green-500" /> : "Log"}
            </Button>
        </div>
    )
}
