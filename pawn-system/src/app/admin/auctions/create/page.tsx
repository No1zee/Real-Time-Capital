import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAuctionableItems, createAuction } from "@/app/actions/admin/auctions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

export default async function AdminCreateAuctionPage() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const items = await getAuctionableItems()

    async function action(formData: FormData) {
        "use server"
        const result = await createAuction(formData)
        if (result.success) {
            redirect("/admin/auctions") // Assuming this page exists or redirect back
        }
        // Error handling would ideally use a client component wrapper or useFormState
        // For prototype, we redirect if success, else... log?
        // Let's rely on the server action revalidating.
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Auction</h1>
                <p className="text-muted-foreground">Launch auctions for pawned or valued assets.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Auction Configuration</CardTitle>
                        <CardDescription>Select an item ID from the list to start.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={action} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="itemId">Asset ID</Label>
                                <Input name="itemId" placeholder="Paste Item ID here" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startPrice">Start Price ($)</Label>
                                    <Input name="startPrice" type="number" min="1" step="0.01" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reservePrice">Reserve Price ($)</Label>
                                    <Input name="reservePrice" type="number" min="1" step="0.01" placeholder="Optional" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="durationDays">Duration (Days)</Label>
                                    <Input name="durationDays" type="number" min="1" max="30" defaultValue="7" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select name="type" defaultValue="ONLINE">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="LIVE">Live Event</SelectItem>
                                            <SelectItem value="SEALED">Sealed Bid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Launch Auction
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Available Assets</CardTitle>
                        <CardDescription>Items ready for auction (Pawned/Valued).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Valuation</TableHead>
                                    <TableHead>ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No eligible items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => {
                                        const typedItem = item as any
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>
                                                    {typedItem.finalValuation
                                                        ? formatCurrency(Number(typedItem.finalValuation))
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs truncate max-w-[80px]" title={item.id}>
                                                    {item.id}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
