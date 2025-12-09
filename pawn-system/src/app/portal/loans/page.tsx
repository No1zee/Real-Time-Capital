
import { getCustomerLoans } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function PortalLoansPage() {
    const loans = await getCustomerLoans()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Loans</h2>
                    <p className="text-slate-500 dark:text-slate-400">View and manage your active and past loans.</p>
                </div>
                <Link href="/portal/loans/apply" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Apply for Loan
                </Link>
            </div>

            {loans.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">You have no loans yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loans.map((loan) => (
                        <Link href={`/portal/loans/${loan.id}`} key={loan.id} className="block group">
                            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-all hover:border-amber-500/50 hover:shadow-lg dark:hover:border-amber-500/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                        Loan #{loan.id.slice(-6)}
                                    </CardTitle>
                                    <Badge variant={loan.status === "ACTIVE" ? "default" : "secondary"}>
                                        {loan.status}
                                    </Badge>
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
            )}
        </div>
    )
}
