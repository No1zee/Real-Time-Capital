import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepositModal } from "@/components/deposit-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function WalletPage() {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 20
            }
        }
    })

    if (!user) return null

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">My Wallet</h1>
                    <p className="text-slate-400 mt-1">Manage your funds and transactions</p>
                </div>
                <DepositModal />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {user.transactions.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No transactions yet</p>
                            ) : (
                                user.transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500' :
                                                    tx.type === 'WITHDRAWAL' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-5 h-5" /> :
                                                    tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="w-5 h-5" /> :
                                                        <Wallet className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {tx.type === 'DEPOSIT' ? 'Wallet Top-up' :
                                                        tx.type === 'WITHDRAWAL' ? 'Withdrawal' :
                                                            tx.type === 'PAYMENT' ? 'Payment' : 'Transaction'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span>{formatDate(tx.createdAt)}</span>
                                                    {tx.reference && (
                                                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                                            {tx.reference}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-white'
                                                }`}>
                                                {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                            </p>
                                            <div className="mt-1">
                                                {tx.status === 'PENDING' && (
                                                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 gap-1 text-[10px] h-5">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </Badge>
                                                )}
                                                {tx.status === 'COMPLETED' && (
                                                    <Badge variant="outline" className="border-green-500/50 text-green-500 gap-1 text-[10px] h-5">
                                                        <CheckCircle2 className="w-3 h-3" /> Completed
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
                        <div className="p-4 bg-black/20 rounded-lg backdrop-blur-sm">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white/70">Held in Bids</span>
                                <span className="font-medium">{formatCurrency(Number(user.frozenBalance))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/70">Total Assets</span>
                                <span className="font-bold">{formatCurrency(Number(user.walletBalance) + Number(user.frozenBalance))}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
