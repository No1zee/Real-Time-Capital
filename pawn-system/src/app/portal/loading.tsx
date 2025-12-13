import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="hidden md:block">
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[180px]">
                {/* Large Card */}
                <Card className="col-span-2 md:col-span-2 md:row-span-2 bg-muted/50">
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-48 mb-2" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-32 mt-6" />
                    </CardContent>
                </Card>

                {/* Smaller Cards */}
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="col-span-1 md:col-span-1 bg-muted/50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-12" />
                        </CardContent>
                    </Card>
                ))}

                {/* Trust Signal */}
                <Card className="col-span-1 md:col-span-2 bg-muted/50">
                    <CardContent className="flex items-center p-6 gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </CardContent>
                </Card>

                {/* Auction CTA */}
                <Card className="col-span-2 md:col-span-2 bg-muted/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-64 mb-4" />
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
