import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepositModal } from "@/components/deposit-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function WalletPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            Transaction: {
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!user) return null

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
                    <p className="text-muted-foreground">Manage your funds and view transaction history.</p>
                </div>
                <DepositModal userId={user.id} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white/90">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-2">
                            {formatCurrency(Number(user.walletBalance))}
                        </div>
                        <p className="text-white/80 text-sm mb-6">
                            Available for bidding and purchases
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!user.Transaction || user.Transaction.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">No recent transactions</p>
                            ) : (
                                user.Transaction.slice(0, 5).map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'PAYMENT_RECEIVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'PAYMENT_RECEIVED' ?
                                                    <ArrowDownLeft className="w-4 h-4" /> :
                                                    <ArrowUpRight className="w-4 h-4" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{tx.type.replace(/_/g, " ")}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'PAYMENT_RECEIVED' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'PAYMENT_RECEIVED' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                            </p>
                                            <div className="flex justify-end mt-1">
                                                {tx.status === 'COMPLETED' && (
                                                    <Badge variant="outline" className="border-green-500/50 text-green-500 gap-1 text-[10px] h-5">
                                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                                    </Badge>
                                                )}
                                                {tx.status === 'PENDING' && (
                                                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 gap-1 text-[10px] h-5">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </Badge>
                                                )}
                                                {tx.status === 'REJECTED' && (
                                                    <Badge variant="outline" className="border-red-500/50 text-red-500 gap-1 text-[10px] h-5">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
