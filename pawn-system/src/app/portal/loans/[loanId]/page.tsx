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

export default async function LoanDetailsPage({ params }: { params: { loanId: string } }) {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    // Fetch Loan with Customer and Items
    const loan = await prisma.loan.findUnique({
        where: { id: params.loanId },
        include: {
            items: true,
            customer: true,
            user: true
        }
    })

    if (!loan) notFound()

    // Security Check
    // @ts-ignore
    const userRole = session.user.role
    // Check ownership via User ID (Digital) OR Email (Legacy/Offline linked)
    const isOwner = (loan.userId === session.user.id) || (loan.customer?.email === session.user.email)
    const isAdmin = userRole === "ADMIN" || userRole === "STAFF"

    if (!isOwner && !isAdmin) {
        return <div className="p-8 text-center text-red-500">Unauthorized access</div>
    }

    // Determine Borrower Data for Ticket
    const borrowerName = loan.customer
        ? `${loan.customer.firstName} ${loan.customer.lastName}`
        : (loan.user?.name || "Digital User")

    const borrowerEmail = loan.customer?.email || loan.user?.email || ""
    const borrowerId = loan.customer?.nationalId || "DIGITAL-ID"
    const borrowerAddress = loan.customer?.address || "Digital Account"
    const borrowerPhone = loan.customer?.phoneNumber || "N/A"

    // Fetch Linked System User (for Verification Status)
    const linkedUser = await prisma.user.findUnique({
        where: { email: borrowerEmail || "placeholder@example.com" }
    })

    // Prepare Customer Data for Ticket
    const customerForTicket = {
        name: borrowerName,
        email: borrowerEmail,
        firstName: loan.customer?.firstName || loan.user?.name?.split(" ")[0] || "User",
        lastName: loan.customer?.lastName || loan.user?.name?.split(" ").slice(1).join(" ") || "",
        nationalId: borrowerId,
        address: borrowerAddress,
        idNumber: borrowerId,
        phoneNumber: borrowerPhone,
        verificationStatus: linkedUser?.verificationStatus || "UNVERIFIED"
    }

    // Calculate financials
    const principal = Number(loan.principalAmount)
    const riskPremium = 0 // Future: dynamic based on TrustScore
    const totalRepayment = principal * (1 + (Number(loan.interestRate) + riskPremium) / 100)

    // For now, assuming no partial payments in DB, so remaining = total
    // TODO: Fetch existing payments to calc real remaining balance
    const remainingBalance = totalRepayment

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/portal/loans" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                                Loan Details
                            </h1>
                            <Badge className={
                                loan.status === "ACTIVE" ? "bg-green-500/10 text-green-600 border-green-200" :
                                    loan.status === "COMPLETED" ? "bg-blue-500/10 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-600"
                            }>
                                {loan.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-mono mt-1">REF: {loan.id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PawnTicket loan={loan} customer={customerForTicket} items={loan.items} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">

                {/* Main Financial Card */}
                <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <CardTitle className="text-lg">Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 font-medium mb-1">Principal</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(principal)}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 font-medium mb-1">Interest Rate</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {Number(loan.interestRate)}%
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20">
                                <p className="text-sm text-amber-600/80 dark:text-amber-500 font-medium mb-1">Total Repayment</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                                    {formatCurrency(totalRepayment)}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {loan.status === "ACTIVE" && (
                            <div className="pt-2">
                                <LoanActions loanId={loan.id} remainingBalance={remainingBalance} status={loan.status} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between group">
                                <span className="text-slate-500 flex items-center gap-2 group-hover:text-primary transition-colors">
                                    <Calendar className="w-4 h-4" /> Start Date
                                </span>
                                <span className="font-medium font-mono">{formatDate(loan.startDate)}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <span className="text-slate-500 flex items-center gap-2 group-hover:text-red-500 transition-colors">
                                    <AlertCircle className="w-4 h-4" /> Due Date
                                </span>
                                <span className="font-medium font-mono text-red-600 dark:text-red-400">
                                    {formatDate(loan.dueDate)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6 md:col-span-1">
                    {/* Collateral */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Collateral Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[300px] overflow-y-auto">
                                {loan.items.map((item, i) => (
                                    <div key={item.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${i !== loan.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className="p-2 h-fit bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                <Package className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                                                <p className="text-xs font-bold text-primary mt-2">
                                                    Val: {formatCurrency(Number(item.valuation))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trust Impact */}
                    <TrustImpactCard status={loan.status} dueDate={loan.dueDate} />
                </div>
            </div>
        </div>
    )
}
