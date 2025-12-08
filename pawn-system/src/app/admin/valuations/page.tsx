import { getPendingValuations } from "@/app/actions/admin/valuation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"

export default async function ValuationQueuePage() {
    const items = await getPendingValuations()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Valuation Queue</h2>
                    <p className="text-muted-foreground">Review and appraise incoming assets.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Items ({items.length})</CardTitle>
                    <CardDescription>Items waiting for official valuation and loan offers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Est. Value</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No pending valuations.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.loan?.customer?.firstName} {item.loan?.customer?.lastName}
                                        </TableCell>
                                        <TableCell>${Number(item.valuation).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                                                {item.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/valuations/${item.id}`}>
                                                <Button size="sm" variant="default">
                                                    <Eye className="w-4 h-4 mr-1" /> Assess
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
