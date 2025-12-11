import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getTransactionDetails } from "@/app/actions/admin/transactions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { TransactionActions } from "@/components/admin/transactions/transaction-actions"

export const dynamic = "force-dynamic"

export default async function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const tx = await getTransactionDetails(id)
    if (!tx) notFound()

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/transactions" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
                        <Badge variant={
                            tx.status === "COMPLETED" ? "success" :
                                tx.status === "PENDING" ? "outline" :
                                    "destructive"
                        }>
                            {tx.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-1">{tx.reference}</p>
                </div>
                <TransactionActions id={tx.id} status={tx.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Transaction Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h3 className="text-muted-foreground mb-1">Amount</h3>
                                <p className="text-2xl font-bold">{formatCurrency(Number(tx.amount))}</p>
                            </div>
                            <div>
                                <h3 className="text-muted-foreground mb-1">Date</h3>
                                <p className="font-medium">{tx.createdAt.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">({formatDistanceToNow(tx.createdAt, { addSuffix: true })})</p>
                            </div>
                            <div>
                                <h3 className="text-muted-foreground mb-1">Method</h3>
                                <Badge variant="outline">{tx.method}</Badge>
                            </div>
                            <div>
                                <h3 className="text-muted-foreground mb-1">Type</h3>
                                <p className="font-medium capitalize">{tx.type.toLowerCase().replace('_', ' ')}</p>
                            </div>
                        </div>

                        {/* Timeline Visualization (Req 5.3.4) */}
                        <div className="pt-6 border-t mt-6">
                            <h3 className="font-semibold mb-4">Lifecycle Timeline</h3>
                            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                                {/* Step 1: Created */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <p className="font-medium">Initialized</p>
                                    <p className="text-xs text-muted-foreground">Transaction created in system.</p>
                                </div>

                                {/* Step 2: Processing */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background">
                                        {tx.status === "PENDING" ? <Clock className="w-6 h-6 text-amber-500" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                    </div>
                                    <p className="font-medium">Processing</p>
                                    <p className="text-xs text-muted-foreground">Sent to Payment Gateway ({tx.method}).</p>
                                </div>

                                {/* Step 3: Final Status */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background">
                                        {tx.status === "COMPLETED" ? <CheckCircle2 className="w-6 h-6 text-green-500" /> :
                                            tx.status === "FAILED" ? <XCircle className="w-6 h-6 text-red-500" /> :
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-slate-100" />
                                        }
                                    </div>
                                    <p className="font-medium">
                                        {tx.status === "COMPLETED" ? "Payment Confirmed" :
                                            tx.status === "FAILED" ? "Payment Failed" : "Awaiting Confirmation"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {tx.status === "FAILED" ? "Gateway rejected the transaction or user cancelled." :
                                            tx.status === "COMPLETED" ? "Funds captured successfully." : "Polling for updates..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Context */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Context</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                {tx.User.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium">{tx.User.name}</p>
                                <p className="text-xs text-muted-foreground">{tx.User.email}</p>
                            </div>
                        </div>
                        <div className="text-sm space-y-2 pt-2 border-t">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">KYC Status</span>
                                <Badge variant={tx.User.verificationStatus === "APPROVED" ? "success" : "default"}>{tx.User.verificationStatus}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span>{tx.User.phoneNumber}</span>
                            </div>
                        </div>
                        <Link href={`/admin/users/${tx.User.id}`}>
                            <Button variant="secondary" className="w-full mt-4">View Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
