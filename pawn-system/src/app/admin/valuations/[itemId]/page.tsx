import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ValuationForm } from "./valuation-form"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function ValuationDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
    const { itemId } = await params
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { User: true }
    })

    if (!item) notFound()

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/admin/valuations" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Queue
            </Link>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border-2 border-dashed">
                            <Package className="w-12 h-12 text-slate-300" />
                            <span className="sr-only">Image Placeholder</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{item.name}</h2>
                            <Badge className="mt-2">{item.category}</Badge>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                            <p className="text-sm">{item.description}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
                            <p className="text-sm font-semibold">{item.User?.name || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground">{item.User?.email || "No email linked"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">
                            Review the item details and market data. Enter the preliminary loan offer amount below. This amount will be presented to the customer.
                        </p>
                        <ValuationForm itemId={item.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
