import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Package, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminValuationsPage() {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const pendingItems = await prisma.item.findMany({
        where: { status: "PENDING_VALUATION" },
        include: { User: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pending Valuations</h1>
                    <p className="text-muted-foreground">Review and assess customer item submissions.</p>
                </div>
                <Badge variant="secondary" className="px-4 py-1">
                    {pendingItems.length} Waiting
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingItems.length === 0 ? (
                    <div className="col-span-full p-12 text-center border-2 border-dashed rounded-lg">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">All Caught Up!</h3>
                        <p className="text-muted-foreground">No pending items to value.</p>
                    </div>
                ) : (
                    pendingItems.map((item) => (
                        <Card key={item.id} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline">{item.category}</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                                <CardTitle className="text-lg mt-2 line-clamp-1">{item.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {item.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Customer</p>
                                        <p className="font-medium">{item.User?.name || "Unknown"}</p>
                                        <p className="text-xs text-slate-500">{item.User?.email}</p>
                                    </div>

                                    <Link href={`/admin/valuations/${item.id}`} className="block">
                                        <Button className="w-full" variant="outline">
                                            Assess Item
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
