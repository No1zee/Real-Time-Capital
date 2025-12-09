"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react"

export function AuditLogTable({ initialLogs, pagination }: any) {
    // Basic implementation for now, will enhance with client-side state later
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search logs..." className="pl-8" />
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialLogs.map((log: any) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap font-mono text-xs">
                                    {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{log.user?.name || "Unknown"}</span>
                                        <span className="text-xs text-slate-500">{log.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        log.action === "DELETE" ? "destructive" :
                                            log.action === "UPDATE" ? "secondary" :
                                                "outline"
                                    }>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium">{log.entityType}</span>
                                    {log.entityId && <span className="block text-xs font-mono text-slate-500">{log.entityId.slice(0, 8)}</span>}
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate text-xs text-slate-500 font-mono">
                                    {log.details}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={pagination.page <= 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
