"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { verifyTransaction } from "@/app/actions/payments"
import { Check, X, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Transaction {
    id: string
    amount: number
    method: string
    reference: string | null
    status: string
    createdAt: string
    user: {
        name: string | null
        email: string | null
    }
}

export function AdminPaymentTable({ initialTransactions }: { initialTransactions: any[] }) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleVerify = async (id: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(id)
        try {
            await verifyTransaction(id, action)
            // Remove from list locally for instant feedback
            setTransactions(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error(error)
            alert("Failed to process transaction")
        } finally {
            setProcessingId(null)
        }
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">
                No pending transactions.
            </div>
        )
    }

    return (
        <div className="rounded-md border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-300">Date</TableHead>
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Method</TableHead>
                        <TableHead className="text-slate-300">Reference</TableHead>
                        <TableHead className="text-slate-300">Amount</TableHead>
                        <TableHead className="text-right text-slate-300">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-medium text-slate-300">
                                {formatDate(new Date(tx.createdAt))}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-slate-200">{tx.user.name || "Unknown"}</span>
                                    <span className="text-xs text-slate-500">{tx.user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-slate-700 text-slate-300">
                                    {tx.method}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-slate-400 text-xs">
                                {tx.reference || "-"}
                            </TableCell>
                            <TableCell className="font-bold text-amber-500">
                                {formatCurrency(Number(tx.amount))}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                        onClick={() => handleVerify(tx.id, "APPROVE")}
                                        disabled={!!processingId}
                                    >
                                        {processingId === tx.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => handleVerify(tx.id, "REJECT")}
                                        disabled={!!processingId}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
