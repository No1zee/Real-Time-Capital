import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { PawnTicket } from "@/components/pawn-ticket"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Calendar, DollarSign, Package, AlertCircle } from "lucide-react"
import { TrustImpactCard } from "@/components/loan/trust-impact-card"
import { LoanActions } from "@/components/loan/loan-actions"
import { LoanStatus } from "@prisma/client"

export default async function LoanDetailsPage({ params }: { params: Promise<{ loanId: string }> }) {
    const { loanId } = await params
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    // Fetch Loan with Items only (Customer/User fetched separately to avoid client issues)
    const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
            items: true,
            payments: true
        }
    })

    if (!loan) notFound()

    // Fetch Related Data Manually
    const customer = loan.customerId ? await prisma.customer.findUnique({ where: { id: loan.customerId } }) : null
    const user = loan.userId ? await prisma.user.findUnique({ where: { id: loan.userId } }) : null

    // Security Check
    // @ts-ignore
    const userRole = session.user.role

    // Check ownership via User ID (Digital) OR Email (Legacy/Offline linked)
    // Use manually fetched customer/user objects
    // @ts-ignore
    const isOwner = ((loan as any).userId === session.user.id) || (customer?.email === session.user.email)
    const isAdmin = userRole === "ADMIN" || userRole === "STAFF"

    if (!isOwner && !isAdmin) {
        redirect("/portal")
    }

    // @ts-ignore
    const totalPaid = loan.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0)
    const totalDue = Number(loan.principalAmount) + (Number(loan.principalAmount) * Number(loan.interestRate) / 100)
    const remainingBalance = totalDue - totalPaid

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/portal/loans" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Loan #{loan.id.slice(0, 8)}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={loan.status === LoanStatus.ACTIVE ? 'default' : 'secondary'}>
                            {loan.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Due: {formatDate(loan.dueDate)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Loan Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Loan Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Principal</p>
                                <p className="text-2xl font-bold">{formatCurrency(Number(loan.principalAmount))}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                                <p className="text-2xl font-bold">{Number(loan.interestRate)}%</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                                    {formatCurrency(remainingBalance)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                                <Package className="mr-2 h-4 w-4" /> Collateral Items
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {/* @ts-ignore */}
                                {loan.items.map((item: any) => (
                                    <div key={item.id} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                                                <p className="text-xs font-bold text-primary mt-2">
                                                    Val: {formatCurrency(Number(item.valuation))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Actions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>Manage your loan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoanActions
                                loanId={loan.id}
                                remainingBalance={remainingBalance}
                                status={loan.status}
                            />
                        </CardContent>
                    </Card>

                    {/* Trust Score Impact */}
                    <TrustImpactCard status={loan.status} dueDate={loan.dueDate} />
                </div>
            </div>
        </div>
    )
}
