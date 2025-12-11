import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTransactions } from "@/app/actions/admin/transactions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminTransactionsPage() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const { transactions, total } = await getTransactions(1, 50)

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Audit Log</h1>
                    <p className="text-muted-foreground">Monitor all system transactions, including failures.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        Showing {transactions.length} of {total} records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx: any) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">{tx.reference || tx.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{tx.User.name}</span>
                                            <span className="text-xs text-muted-foreground">{tx.User.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(Number(tx.amount))}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{tx.method}</Badge>
                                    </TableCell>
                                    <TableCell>{tx.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            tx.status === "COMPLETED" ? "success" :
                                                tx.status === "PENDING" ? "outline" :
                                                    "destructive"
                                        }>
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
