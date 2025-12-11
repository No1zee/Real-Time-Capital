import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getExceptionTransactions } from "@/app/actions/admin/reports"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import { AlertTriangle, Clock, XCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ExceptionsReportPage() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const exceptions = await getExceptionTransactions()

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exceptions Report</h1>
                    <p className="text-muted-foreground">Monitoring anomalies, failures, and stuck transactions.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {exceptions.length === 0 ? (
                    <Card className="bg-slate-50 border-dashed">
                        <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium">All Systems Nominal</h3>
                            <p className="text-muted-foreground">No transaction anomalies detected in the last window.</p>
                        </CardContent>
                    </Card>
                ) : (
                    exceptions.map((tx: any) => (
                        <Card key={tx.id} className="group hover:border-blue-500 transition-colors">
                            <div className="flex items-center p-4 gap-4">
                                <div className={`p-2 rounded-full flex-shrink-0 ${tx.status === "FAILED" ? "bg-red-100 text-red-600" :
                                    tx.status === "CANCELLED" ? "bg-orange-100 text-orange-600" :
                                        "bg-amber-100 text-amber-600"
                                    }`}>
                                    {tx.status === "FAILED" ? <XCircle className="w-5 h-5" /> :
                                        tx.status === "CANCELLED" ? <AlertTriangle className="w-5 h-5" /> :
                                            <Clock className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium truncate">{tx.reference || "No Reference"}</h4>
                                        <Badge variant="outline">{tx.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {formatCurrency(Number(tx.amount))} • {tx.User.name} ({tx.User.email})
                                    </p>
                                    {tx.status === "PENDING" && (
                                        <p className="text-xs text-amber-600 font-medium mt-1">
                                            Stuck for {formatDistanceToNow(tx.createdAt)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="hidden sm:inline">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                    <Link href={`/admin/transactions/${tx.id}`}>
                                        <Button size="sm" variant="ghost">
                                            View <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
