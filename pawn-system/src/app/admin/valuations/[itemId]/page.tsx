import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ValuationForm from "./valuation-form"

export default async function ValuationDetailPage({ params }: { params: { itemId: string } }) {
    const item = await db.item.findUnique({
        where: { id: params.itemId },
        include: {
            loan: {
                include: {
                    customer: true
                }
            }
        }
    })

    if (!item) return notFound()

    // Parse rich details if present
    let details: any = {}
    try {
        if (item.valuationDetails) {
            details = JSON.parse(item.valuationDetails)
        }
    } catch (e) {
        console.error("Failed to parse valuation details", e)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appraisal Dashboard</h2>
                    <p className="text-muted-foreground">Assess value and generate loan offer.</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                    {item.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Item & Asset Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Item Name</span>
                                    <p className="font-medium text-lg">{item.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    <p className="font-medium">{item.category}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Description</span>
                                <p className="mt-1 text-sm leading-relaxed">{item.description}</p>
                            </div>

                            <Separator />

                            {/* Rich Details Section */}
                            <div>
                                <h4 className="font-semibold mb-3 text-amber-600">Valuation Attributes</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                    {Object.entries(details).map(([key, value]) => (
                                        <div key={key} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                                            <dt className="text-muted-foreground capitalize">{key}</dt>
                                            <dd className="font-medium mt-1">{String(value)}</dd>
                                        </div>
                                    ))}
                                    {Object.keys(details).length === 0 && (
                                        <p className="text-muted-foreground italic col-span-2">No special attributes provided.</p>
                                    )}
                                </dl>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <p className="font-medium">{item.loan?.customer?.firstName} {item.loan?.customer?.lastName}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">National ID</span>
                                    <p className="font-medium">{item.loan?.customer?.nationalId}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Phone</span>
                                    <p className="font-medium">{item.loan?.customer?.phoneNumber}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Client Since</span>
                                    <p className="font-medium">{item.loan?.customer?.createdAt.toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Valuation Action */}
                <div>
                    <ValuationForm itemId={item.id} clientEstimate={Number(item.valuation)} />
                </div>
            </div>
        </div>
    )
}
