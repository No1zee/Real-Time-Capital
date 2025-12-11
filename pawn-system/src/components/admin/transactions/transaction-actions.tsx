"use client"

import { reverseTransaction, resubmitTransaction } from "@/app/actions/admin/transactions"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TransactionActions({ id, status }: { id: string, status: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleReverse = async () => {
        if (!confirm("Are you sure you want to reverse this transaction? This action cannot be undone.")) return

        setLoading(true)
        try {
            await reverseTransaction(id, "Manual Reversal via Portal")
            toast.success("Transaction Reversed")
            router.refresh()
        } catch (err) {
            toast.error("Failed to reverse")
        } finally {
            setLoading(false)
        }
    }

    const handleResubmit = async () => {
        setLoading(true)
        try {
            await resubmitTransaction(id)
            toast.success("Transaction Resubmitted")
            router.refresh()
        } catch (err) {
            toast.error("Failed to resubmit")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="ml-auto flex gap-2">
            <Button
                variant="outline"
                onClick={handleResubmit}
                disabled={loading || status === "COMPLETED"}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Resubmit
            </Button>
            <Button
                variant="destructive"
                onClick={handleReverse}
                disabled={loading || status !== "COMPLETED"}
            >
                <AlertTriangle className="mr-2 h-4 w-4" /> Reverse
            </Button>
        </div>
    )
}
