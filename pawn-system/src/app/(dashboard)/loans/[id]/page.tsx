import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Package, CreditCard, DollarSign } from "lucide-react"
import { db } from "@/lib/db"
import { LoanDetailsClient } from "@/components/LoanDetailsClient"
import { PawnTicket } from "@/components/pawn-ticket"
import { formatCurrency } from "@/lib/utils"
import { LoanStatus } from "@prisma/client"

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
            Item: true,
            Payment: {
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    })

    if (!loan) {
        notFound()
    }

    // Fetch related data manually
    // @ts-ignore
    const customer = loan.customerId ? await db.customer.findUnique({ where: { id: loan.customerId } }) : null
    // @ts-ignore
    const user = loan.userId ? await db.user.findUnique({ where: { id: loan.userId } }) : null

    // @ts-ignore
    const totalPaid = loan.payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/loans" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Loan Details</h2>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <span>ID: {loan.id}</span>
                            <span>•</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${loan.status === LoanStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                                loan.status === LoanStatus.DEFAULTED ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {loan.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {/* @ts-ignore */}
                    <PawnTicket loan={loan} customer={customer} item={loan.items[0]} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Details */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight flex items-center">
                            <User className="mr-2 h-4 w-4" /> Customer Information
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        {customer ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p>{customer.firstName} {customer.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p>{customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    <p>{customer.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Identity ID</p>
                                    <p>{customer.nationalId || "N/A"}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500">Customer not attached</p>
                        )}
                    </div>
                </div>

                {/* Loan Terms */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" /> Finanical Details
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Principal</p>
                                <p>{formatCurrency(Number(loan.principalAmount))}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                                <p>{Number(loan.interestRate)}%</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                                <p>{formatCurrency(totalPaid)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                                <p>{new Date(loan.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collateral Items */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold leading-none tracking-tight flex items-center">
                        <Package className="mr-2 h-4 w-4" /> Collateral Items
                    </h3>
                </div>
                <div className="p-6 pt-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valuation</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serial</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {/* @ts-ignore */}
                                {loan.items.map((item: any) => (
                                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{item.name}</td>
                                        <td className="p-4 align-middle">{item.category}</td>
                                        <td className="p-4 align-middle">{formatCurrency(Number(item.valuation))}</td>
                                        <td className="p-4 align-middle">{item.serialNumber || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payments History */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold leading-none tracking-tight flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" /> Payment History
                        </h3>
                    </div>
                </div>
                <div className="p-6 pt-0">
                    {/* @ts-ignore */}
                    {loan.payments.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {/* @ts-ignore */}
                                    {loan.payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle">{formatCurrency(Number(payment.amount))}</td>
                                            <td className="p-4 align-middle">
                                                <div className="font-medium">{payment.type}</div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-sm text-muted-foreground">{payment.status}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No payments recorded yet.</p>
                    )}
                </div>
            </div>

            {/* @ts-ignore */}
            <LoanDetailsClient loan={loan} />
        </div>
    )
}
