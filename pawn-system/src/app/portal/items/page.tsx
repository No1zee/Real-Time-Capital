import { getCustomerItems } from "@/app/actions/portal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Package, Trophy, Lock, Calendar } from "lucide-react"
import Link from "next/link"

export default async function PortalItemsPage() {
    const { wonItems, pawnedItems } = await getCustomerItems()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Items</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Items you own and items held as collateral</p>
            </div>

            {/* ITEMS WON IN AUCTIONS */}
            {wonItems.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Items Won in Auctions</h3>
                        <Badge variant="outline">{wonItems.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {wonItems.map((item) => {
                            const images = item.images ? JSON.parse(item.images as string) : []
                            const firstImage = images[0]

                            return (
                                <Card key={item.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 overflow-hidden">
                                    {/* Item Image */}
                                    {firstImage && (
                                        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900">
                                            <img
                                                src={firstImage}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                OWNED
                                            </div>
                                        </div>
                                    )}

                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                            {item.name}
                                        </CardTitle>
                                        <Trophy className="h-4 w-4 text-amber-600" />
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Purchase Price</p>
                                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                                {formatCurrency(Number(item.salePrice || item.valuation))}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{item.category}</Badge>
                                            {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                                            {!firstImage && <Badge className="bg-green-600">OWNED</Badge>}
                                        </div>

                                        {item.soldAt && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                Won: {formatDate(item.soldAt)}
                                            </div>
                                        )}

                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* ITEMS HELD AS COLLATERAL */}
            {pawnedItems.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Items Held as Collateral</h3>
                        <Badge variant="outline">{pawnedItems.length}</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pawnedItems.map((item) => (
                            <Link href={`/portal/loans/${item.Loan?.id}`} key={item.id} className="block group">
                                <Card className="bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800 transition-all hover:border-blue-500 hover:shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {item.name}
                                        </CardTitle>
                                        <Package className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Valuation</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(Number(item.valuation))}
                                            </p>
                                        </div>

                                        {item.Loan && (
                                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-100 dark:border-blue-900">
                                                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                                                    Loan: {formatCurrency(Number(item.Loan.principalAmount))}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    Due: {formatDate(item.Loan.dueDate)}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{item.category}</Badge>
                                            {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                                            <Badge className="bg-blue-600">{item.Loan?.status || "PAWNED"}</Badge>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* EMPTY STATE */}
            {wonItems.length === 0 && pawnedItems.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Items Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            You haven't won any auctions or pawned any items yet
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/portal/auctions" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                                Browse Auctions →
                            </Link>
                            <Link href="/portal/loans/apply" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Apply for Loan →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
