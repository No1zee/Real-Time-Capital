
import { getCustomerLoans } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, DollarSign } from "lucide-react"

export default async function PortalLoansPage() {
    const loans = await getCustomerLoans()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Loans</h2>
                <p className="text-slate-500 dark:text-slate-400">View and manage your active and past loans.</p>
            </div>

            {loans.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">You have no loans yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loans.map((loan) => (
                        <Card key={loan.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Loan #{loan.id.slice(-6)}
                                </CardTitle>
                                <Badge variant={loan.status === "ACTIVE" ? "default" : "secondary"}>
                                    {loan.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {formatCurrency(Number(loan.principalAmount))}
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Due: {formatDate(loan.dueDate)}
                                    </div>
                                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Rate: {Number(loan.interestRate)}%
                                    </div>
                                </div>

                                {loan.items && loan.items.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Collateral:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {loan.items.map((item) => (
                                                <Badge key={item.id} variant="outline" className="text-xs">
                                                    {item.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
