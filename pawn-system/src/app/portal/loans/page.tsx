import { getCustomerLoans } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default async function PortalLoansPage() {
    const loans = await getCustomerLoans()

    // Categorize loans
    const approvedOffers = loans.filter(l => l.status === "APPROVED")
    const pendingValuation = loans.filter(l => l.status === "PENDING")
    const activeLoans = loans.filter(l => l.status === "ACTIVE")
    const otherLoans = loans.filter(l => !["APPROVED", "PENDING", "ACTIVE"].includes(l.status))

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Loans</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your loan offers and active loans in one place</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                    <Link href="/portal/loans/apply">
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Apply
                    </Link>
                </Button>
            </div>

            {/* APPROVED OFFERS - Priority Section */}
            {approvedOffers.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-600 dark:text-green-500" />
                        <h3 className="text-xl font-bold text-green-600 dark:text-green-500">Offers Ready to Accept</h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {approvedOffers.length} {approvedOffers.length === 1 ? 'Offer' : 'Offers'}
                        </Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {approvedOffers.map((loan) => (
                            <Link href={`/portal/loans/${loan.id}`} key={loan.id} className="block group">
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500 dark:border-green-700 transition-all hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        ACTION REQUIRED
                                    </div>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                                            {formatCurrency(Number(loan.principalAmount))}
                                        </CardTitle>
                                        <CardDescription className="font-medium text-slate-700 dark:text-slate-300">
                                            {loan.Item && loan.Item.length > 0 ? loan.Item.map(i => i.name).join(", ") : "Loan Offer"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded">
                                                <p className="text-xs text-slate-600 dark:text-slate-400">Interest</p>
                                                <p className="font-bold text-slate-900 dark:text-white">{Number(loan.interestRate)}%</p>
                                            </div>
                                            <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded">
                                                <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                                                <p className="font-bold text-slate-900 dark:text-white">{loan.durationDays} days</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-amber-800 dark:text-amber-200">Bring your item to our branch for final valuation before accepting</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            View & Accept Offer
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* PENDING VALUATION */}
            {pendingValuation.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pending Valuation</h3>
                        <Badge variant="outline">{pendingValuation.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingValuation.map((loan) => (
                            <Link href={`/portal/loans/${loan.id}`} key={loan.id} className="block group">
                                <Card className="bg-white dark:bg-slate-950 border-amber-200 dark:border-amber-800 transition-all hover:border-amber-500 hover:shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Loan #{loan.id.slice(-6)}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                                            PENDING
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                Awaiting Valuation
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Submitted: {formatDate(loan.createdAt)}
                                            </p>
                                        </div>
                                        {loan.Item && loan.Item.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Items:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {loan.Item.map((item) => (
                                                        <Badge key={item.id} variant="outline" className="text-xs">
                                                            {item.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ACTIVE LOANS */}
            {activeLoans.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Loans</h3>
                        <Badge variant="outline">{activeLoans.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeLoans.map((loan) => (
                            <Link href={`/portal/loans/${loan.id}`} key={loan.id} className="block group">
                                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-all hover:border-blue-500 hover:shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Loan #{loan.id.slice(-6)}
                                        </CardTitle>
                                        <Badge className="bg-blue-600">ACTIVE</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(Number(loan.principalAmount))}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Due: {formatDate(loan.dueDate)}
                                            </p>
                                        </div>
                                        {loan.Item && loan.Item.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Collateral:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {loan.Item.map((item) => (
                                                        <Badge key={item.id} variant="outline" className="text-xs">
                                                            {item.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* OTHER LOANS (COMPLETED, DEFAULTED) */}
            {otherLoans.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Past Loans</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {otherLoans.map((loan) => (
                            <Link href={`/portal/loans/${loan.id}`} key={loan.id} className="block group opacity-75 hover:opacity-100">
                                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Loan #{loan.id.slice(-6)}
                                        </CardTitle>
                                        <Badge variant="secondary">{loan.status}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2">
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(Number(loan.principalAmount))}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* EMPTY STATE */}
            {loans.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Loans Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Apply for your first loan to get started
                        </p>
                        <Button asChild className="bg-amber-600 hover:bg-amber-700">
                            <Link href="/portal/loans/apply">
                                <Plus className="w-4 h-4 mr-2" />
                                Quick Apply
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
