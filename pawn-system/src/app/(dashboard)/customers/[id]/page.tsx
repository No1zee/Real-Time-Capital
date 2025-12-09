import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, FileText } from "lucide-react"
import { EditCustomerForm } from "@/components/EditCustomerForm"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function CustomerDetailsPage({ params }: PageProps) {
    const { id } = await params

    const customer = await db.customer.findUnique({
        where: { id },
        include: {
            Loan: {
                orderBy: { createdAt: "desc" },
                include: {
                    Item: true,
                },
            },
        },
    })

    if (!customer) {
        notFound()
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center space-x-4">
                <Link href="/customers" className="p-2 hover:bg-accent rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{customer.firstName} {customer.lastName}</h2>
                    <p className="text-muted-foreground">Customer Profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Profile</h3>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <EditCustomerForm customer={customer} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Loan History */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Loan History</h3>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6">
                            {customer.Loan.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                                    No loans found for this customer.
                                </div>
                            ) : (
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50">
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Item</th>
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {customer.Loan.map((loan) => (
                                                <tr key={loan.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-2 align-middle">{new Date(loan.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-2 align-middle">{loan.Item[0]?.name || "Unknown Item"}</td>
                                                    <td className="p-2 align-middle">${Number(loan.principalAmount).toFixed(2)}</td>
                                                    <td className="p-2 align-middle">
                                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${loan.status === "ACTIVE" ? "border-green-200 bg-green-50 text-green-700" :
                                                            loan.status === "DEFAULTED" ? "border-red-200 bg-red-50 text-red-700" :
                                                                "border-gray-200 bg-gray-50 text-gray-700"
                                                            }`}>
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 align-middle text-right">
                                                        <Link
                                                            href={`/loans/${loan.id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
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
