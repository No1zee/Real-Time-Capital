import { auth } from "@/auth"
import { getWalletBalance, getTransactions, depositFunds } from "@/app/actions/wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Wallet, ArrowUpRight, ArrowDownLeft, History } from "lucide-react"
import { redirect } from "next/navigation"

export default async function WalletPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const balance = await getWalletBalance()
    const transactions = await getTransactions()

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Wallet</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white/90">
                            <Wallet className="w-5 h-5" />
                            Current Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-6">
                            {formatCurrency(balance)}
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <h3 className="font-medium mb-3 text-sm text-white/90">Quick Deposit</h3>
                            <form action={async (formData) => {
                                "use server"
                                const amount = Number(formData.get("amount"))
                                await depositFunds(amount)
                            }} className="flex gap-2">
                                <Input
                                    type="number"
                                    name="amount"
                                    placeholder="Amount"
                                    min="1"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50"
                                />
                                <Button type="submit" className="bg-white text-amber-600 hover:bg-white/90 font-semibold">
                                    Deposit
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-600 dark:text-slate-400">
                        <p>
                            Funds in your wallet are used to place bids on auctions.
                            When you win an auction, the amount will be deducted from your balance.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>Deposits Instant</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                <History className="w-4 h-4" />
                                <span>Secure History</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No transactions yet.</p>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                                tx.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {tx.type === 'DEPOSIT' ? 'Deposit' : tx.type}
                                            </p>
                                            <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                                        }`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
