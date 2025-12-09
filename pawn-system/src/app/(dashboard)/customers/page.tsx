import { db } from "@/lib/db"
import { Users, Search } from "lucide-react"
import Link from "next/link"

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams

    const customers = await db.customer.findMany({
        where: {
            OR: q ? [
                { firstName: { contains: q } },
                { lastName: { contains: q } },
                { nationalId: { contains: q } },
                { phoneNumber: { contains: q } },
            ] : undefined,
        },
        include: {
            Loan: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">Manage your customer base.</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <form>
                        <input
                            name="q"
                            defaultValue={q}
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Search customers..."
                        />
                    </form>
                </div>
            </div>

            {/* Customers Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    {customers.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No customers found.
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">National ID</th>
                                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Phone</th>
                                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Total Loans</th>
                                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Active</th>
                                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {customers.map((customer) => {
                                        const activeLoans = customer.loans.filter(l => l.status === "ACTIVE" || l.status === "PENDING").length
                                        return (
                                            <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-2 align-middle font-medium">
                                                    {customer.firstName} {customer.lastName}
                                                </td>
                                                <td className="p-2 align-middle">{customer.nationalId}</td>
                                                <td className="p-2 align-middle">{customer.phoneNumber}</td>
                                                <td className="p-2 align-middle text-center">{customer.loans.length}</td>
                                                <td className="p-2 align-middle text-center">
                                                    {activeLoans > 0 ? (
                                                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                                            {activeLoans}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-2 align-middle text-right">
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
