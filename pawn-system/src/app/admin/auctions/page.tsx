import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllAuctionsAdmin, cancelAuction, forceEndAuction } from "@/app/actions/admin/auctions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Search, Gavel, XCircle, StopCircle, Eye } from "lucide-react"
import Link from "next/link"

export default async function AdminAuctionsPage() {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const auctions = await getAllAuctionsAdmin()

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Auction Management</h1>
                    <p className="text-slate-500 mt-1">Oversee active, scheduled, and past auctions.</p>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Auctions</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="search"
                                placeholder="Search auctions..."
                                className="pl-9 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Current Bid</TableHead>
                                <TableHead>Bids</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auctions.map((auction) => (
                                <TableRow key={auction.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{auction.Item.name}</p>
                                            <p className="text-sm text-slate-500">{auction.Item.category}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            auction.status === "ACTIVE" ? "default" :
                                                auction.status === "SCHEDULED" ? "secondary" :
                                                    auction.status === "ENDED" ? "outline" : "destructive"
                                        }>
                                            {auction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(Number(auction.currentBid || auction.startPrice))}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Gavel className="h-3 w-3 text-slate-400" />
                                            <span>{auction._count.Bid}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {formatDate(auction.endTime)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/portal/auctions/${auction.id}`} target="_blank">
                                                <Button variant="ghost" size="icon" title="View Auction">
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </Link>

                                            {auction.status === "ACTIVE" && (
                                                <form action={async () => {
                                                    "use server"
                                                    await forceEndAuction(auction.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" title="Force End Now">
                                                        <StopCircle className="h-4 w-4 text-amber-500" />
                                                    </Button>
                                                </form>
                                            )}

                                            {(auction.status === "ACTIVE" || auction.status === "SCHEDULED") && (
                                                <form action={async () => {
                                                    "use server"
                                                    await cancelAuction(auction.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" title="Cancel Auction">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
