import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Search Filters Skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
                            <div className="p-6 pt-4 space-y-4">
                                <div>
                                    <Skeleton className="h-8 w-1/3 mb-2" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-10" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-10" />
                                        <Skeleton className="h-4 w-8" />
                                    </div>
                                </div>

                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
