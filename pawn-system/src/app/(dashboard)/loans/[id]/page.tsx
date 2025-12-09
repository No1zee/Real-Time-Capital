import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Package, CreditCard, Calendar, DollarSign, AlertCircle } from "lucide-react"
import { db } from "@/lib/db"
import { LoanDetailsClient } from "@/components/LoanDetailsClient"
import { PawnTicket } from "@/components/pawn-ticket"

interface LoanDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function LoanDetailsPage({ params }: LoanDetailsPageProps) {
    const { id } = await params

    const loan = await db.loan.findUnique({
        where: { id },
        include: {
            customer: true,
            user: true, // Include Digital User
            items: true,
            payments: {
                orderBy: {
                    date: "desc",
                },
            },
        },
    })

    if (!loan) {
        notFound()
    }

    // Determine Borrower Info (Offline Customer vs. Digital User)
    const borrowerName = loan.customer
        ? `${loan.customer.firstName} ${loan.customer.lastName}`
        : (loan.user?.name || "Unknown Borrower")

    const borrowerId = loan.customer?.nationalId || "Digital ID"
    const borrowerPhone = loan.customer?.phoneNumber || "N/A"
    const borrowerEmail = loan.customer?.email || loan.user?.email || "N/A"

    const totalPaid = loan.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0)
    const principal = Number(loan.principalAmount)
    const interest = (principal * Number(loan.interestRate)) / 100
    const totalDue = principal + interest
    const remainingBalance = totalDue - totalPaid

    // Status Badge Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "bg-green-500/10 text-green-600 border-green-200"
            case "PENDING": return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
            case "DEFAULTED": return "bg-red-500/10 text-red-600 border-red-200"
            case "COMPLETED": return "bg-blue-500/10 text-blue-600 border-blue-200"
            default: return "bg-gray-500/10 text-gray-600 border-gray-200"
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/loans" className="p-2 hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-3xl font-bold tracking-tight">Loan #{loan.id.slice(-8).toUpperCase()}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(loan.status)}`}>
                                {loan.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground">Created on {new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PawnTicket loan={loan} customer={loan.customer || { firstName: borrowerName, lastName: "", nationalId: borrowerId, address: "Digital", phoneNumber: borrowerPhone }} items={loan.items} />
                    <LoanDetailsClient
                        loanId={loan.id}
                        remainingBalance={remainingBalance}
                        status={loan.status}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Customer & Item */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Customer Details</h3>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{borrowerName}</div>
                            <p className="text-xs text-muted-foreground mb-4">{borrowerId}</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span>{borrowerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span>{borrowerEmail}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item Card */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Collateral Item</h3>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            {loan.items.map((item: any) => (
                                <div key={item.id} className="space-y-4">
                                    <div>
                                        <div className="text-lg font-semibold">{item.name}</div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <div className="space-y-1 text-sm border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Serial:</span>
                                            <span className="font-mono">{item.serialNumber || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Valuation:</span>
                                            <span>${Number(item.valuation).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className="capitalize">{item.status.replace("_", " ").toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Loan Terms & Payments */}
                <div className="md:col-span-2 space-y-6">
                    {/* Financial Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                            <div className="text-sm font-medium text-muted-foreground">Principal</div>
                            <div className="text-2xl font-bold">${principal.toFixed(2)}</div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                            <div className="text-sm font-medium text-muted-foreground">Interest ({Number(loan.interestRate)}%)</div>
                            <div className="text-2xl font-bold">${interest.toFixed(2)}</div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 bg-primary/5 border-primary/20">
                            <div className="text-sm font-medium text-primary">Remaining Balance</div>
                            <div className="text-2xl font-bold text-primary">${remainingBalance.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Total Due: ${totalDue.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-muted rounded-full">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Loan Period</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{loan.durationDays} Days</p>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Payment History</h3>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6">
                            {loan.payments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No payments recorded yet.
                                </div>
                            ) : (
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50">
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Method</th>
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Reference</th>
                                                <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {loan.payments.map((payment: any) => (
                                                <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-2 align-middle">{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="p-2 align-middle">{payment.method}</td>
                                                    <td className="p-2 align-middle font-mono text-xs">{payment.reference || "-"}</td>
                                                    <td className="p-2 align-middle text-right font-medium">${Number(payment.amount).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
