import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { PawnTicket } from "@/components/pawn-ticket"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Calendar, DollarSign, Package } from "lucide-react"

export default async function LoanDetailsPage({ params }: { params: { loanId: string } }) {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    // Fetch Loan with Customer and Items
    const loan = await prisma.loan.findUnique({
        where: { id: params.loanId },
        include: {
            items: true,
            customer: true // Correct relation
        }
    })

    if (!loan) notFound()

    // Security Check: Ensure logged-in user owns this loan (via email match)
    // Or allow if user is ADMIN/STAFF
    const userRole = (session.user as any).role
    const isOwner = loan.customer.email === session.user.email
    const isAdmin = userRole === "ADMIN" || userRole === "STAFF"

    if (!isOwner && !isAdmin) {
        return <div className="p-8 text-center text-red-500">Unauthorized access</div>
    }

    // Fetch Linked System User (for Verification Status)
    // We assume the Customer's email links to a User account
    const linkedUser = await prisma.user.findUnique({
        where: { email: loan.customer.email || "" }
    })

    // Prepare Customer Data for Ticket
    const customerForTicket = {
        name: `${loan.customer.firstName} ${loan.customer.lastName}`,
        email: loan.customer.email,
        firstName: loan.customer.firstName,
        lastName: loan.customer.lastName,
        nationalId: loan.customer.nationalId,
        address: loan.customer.address,
        idNumber: loan.customer.nationalId,
        verificationStatus: linkedUser?.verificationStatus || "UNVERIFIED"
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/portal/loans" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loan Details</h1>
                        <p className="text-sm text-slate-500">Reference: {loan.id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PawnTicket loan={loan} customer={customerForTicket} items={loan.items} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Loan Status</CardTitle>
                                <CardDescription>Current state of your agreement</CardDescription>
                            </div>
                            <Badge className={
                                loan.status === "ACTIVE" ? "bg-green-500" :
                                    loan.status === "COMPLETED" ? "bg-blue-500" : "bg-slate-500"
                            }>
                                {loan.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Principal Amount</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(Number(loan.principalAmount))}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Repayment Amount</p>
                                {/* Calculate repayment manually since it's not in DB yet or optional */}
                                <p className="text-2xl font-bold text-amber-600">
                                    {formatCurrency(Number(loan.principalAmount) * (1 + Number(loan.interestRate) / 100))}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date</span>
                                <span className="font-medium">{formatDate(loan.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Due Date</span>
                                <span className="font-medium">{formatDate(loan.dueDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Interest Rate</span>
                                <span className="font-medium">{Number(loan.interestRate)}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Collateral Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Collateral</CardTitle>
                        <CardDescription>{loan.items.length} Item(s) Pledged</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loan.items.map((item) => (
                                <div key={item.id} className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-md">
                                        <Package className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                                            Val: {formatCurrency(Number(item.valuation))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
