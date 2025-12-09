import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Shield, Search, User } from "lucide-react"

export default async function AuditLogPage() {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        redirect("/portal")
    }

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            user: {
                select: { name: true, email: true, role: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Track system security and compliance events.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-200">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold text-sm">Compliance Mode Active</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Showing last 50 system events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Entity</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-mono text-xs">{formatDate(log.createdAt)}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-slate-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{log.user.name || "Unknown"}</span>
                                                        <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                                    ${log.action === "LOGIN" ? "bg-green-100 text-green-800" :
                                                        log.action === "DELETE" ? "bg-red-100 text-red-800" :
                                                            log.action === "PERMISSION_CHANGE" ? "bg-amber-100 text-amber-800" :
                                                                "bg-slate-100 text-slate-800"}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.entityType}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{log.entityId?.slice(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <code className="text-xs bg-muted px-1 py-0.5 rounded max-w-[200px] truncate block" title={log.details || ""}>
                                                    {log.details || "-"}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
