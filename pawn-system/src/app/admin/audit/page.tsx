import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuditLogs } from "@/app/actions/admin/audit"
import { AuditLogTable } from "./audit-log-table"

export default async function AuditPage({ searchParams }: { searchParams: { page?: string, action?: string } }) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        redirect("/portal")
    }

    const page = Number(searchParams.page) || 1
    const { logs, pagination } = await getAuditLogs({ action: searchParams.action as any }, page)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Trail</h1>
                    <p className="text-slate-500 mt-1">System-wide activity logging and security tracking</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <AuditLogTable
                        initialLogs={logs}
                        pagination={pagination}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
