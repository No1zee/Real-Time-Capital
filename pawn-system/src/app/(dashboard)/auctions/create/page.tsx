
import { createAuction, getUnredeemedItems } from "@/app/actions/auction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

export default async function CreateAuctionPage() {
    const items = await getUnredeemedItems()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Auction</h2>
                <p className="text-slate-500 dark:text-slate-400">List an unredeemed item for auction.</p>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Auction Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createAuction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="itemId">Select Item</Label>
                            <Select name="itemId" required>
                                <SelectTrigger id="itemId">
                                    <SelectValue placeholder="Select an item..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">No items available</div>
                                    ) : (
                                        items.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} - {formatCurrency(Number(item.valuation))}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startPrice">Starting Price</Label>
                            <Input
                                type="number"
                                name="startPrice"
                                id="startPrice"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    type="datetime-local"
                                    name="startTime"
                                    id="startTime"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    type="datetime-local"
                                    name="endTime"
                                    id="endTime"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                Create Auction
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
