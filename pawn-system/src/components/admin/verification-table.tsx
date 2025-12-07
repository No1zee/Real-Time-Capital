"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { verifyUser } from "@/app/actions/kyc"
import { toast } from "sonner"
import { Check, X, ExternalLink } from "lucide-react"
import { useState } from "react"

interface PendingUser {
    id: string
    name: string | null
    email: string | null
    idImage: string | null
    createdAt: string
}

export function AdminVerificationTable({ users }: { users: PendingUser[] }) {
    const [pendingUsers, setPendingUsers] = useState(users)

    async function handleVerify(userId: string, action: "APPROVE" | "REJECT") {
        try {
            await verifyUser(userId, action)
            toast.success(`User ${action === "APPROVE" ? "verified" : "rejected"}`)
            setPendingUsers(prev => prev.filter(u => u.id !== userId))
        } catch (error) {
            toast.error("Action failed")
        }
    }

    if (pendingUsers.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">No pending verification requests.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{user.name || "Unnamed"}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.idImage ? (
                                    <a
                                        href={user.idImage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                    >
                                        View ID <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-slate-400 text-sm">No image</span>
                                )}
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleVerify(user.id, "REJECT")}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleVerify(user.id, "APPROVE")}
                                    >
                                        <Check className="w-4 h-4" />
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
