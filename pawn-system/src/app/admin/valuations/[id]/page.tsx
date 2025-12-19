import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Tag, CircleDollarSign } from "lucide-react"
import Link from "next/link"
import { ValuationControls } from "../ValuationControls"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ValuationDetailPage({ params }: PageProps) {
    const session = await auth()
    // @ts-ignore
    const userRole = session?.user?.role
    const { id } = await params

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
        redirect("/portal")
    }

    const item = await prisma.item.findUnique({
        where: { id },
        include: {
            User: true
        }
    })

    if (!item) {
        notFound()
    }

    // Parse images safely
    let images: string[] = []
    try {
        const parsed = JSON.parse(item.images as string)
        if (Array.isArray(parsed)) images = parsed
    } catch (e) {
        console.error("Error parsing images")
    }

    // Helper to render label-value pairs
    const DetailRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
        if (!value) return null
        return (
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
                <span className="font-medium text-slate-900 dark:text-slate-200 text-sm text-right">{value}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/admin/valuations">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Valuation Assessment</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>ID: {item.id.substring(0, 8)}</span>
                        <span>•</span>
                        <span>Submitted {formatDate(item.createdAt)}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    <Badge className={
                        item.valuationStatus === "PENDING_MARKET_EVAL" ? "bg-amber-500" :
                            item.valuationStatus === "PENDING_FINAL_OFFER" ? "bg-blue-500" :
                                item.valuationStatus === "OFFER_READY" ? "bg-green-500" :
                                    "bg-slate-500"
                    }>
                        {item.valuationStatus.replace(/_/g, " ")}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Item Details */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Main Image & Info */}
                    <Card className="overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 relative">
                            {images.length > 0 ? (
                                <img src={images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100 dark:bg-slate-900">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2">{item.category}</Badge>
                                    <CardTitle className="text-2xl">{item.name}</CardTitle>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-slate-600 font-medium block">User Estimate</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                        {formatCurrency(Number(item.userEstimatedValue))}
                                    </span>
                                </div>
                            </div>
                            <CardDescription className="mt-2 text-base">
                                {item.description}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Specific Details Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Core Specs */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-slate-500" />
                                    Specifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <DetailRow label="Condition" value={item.condition} />
                                <DetailRow label="Year of Purchase" value={item.yearOfPurchase} />
                                <DetailRow label="Dimensions" value={item.dimensions} />
                                <DetailRow label="Location" value={item.location} />
                            </CardContent>
                        </Card>

                        {/* Category Specifics */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CircleDollarSign className="w-4 h-4 text-slate-500" />
                                    Risk & Provenance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {item.category === "VEHICLE" && (
                                    <>
                                        <DetailRow label="VIN" value={item.vin} />
                                        <DetailRow label="Mileage" value={`${item.mileage?.toLocaleString()} km`} />
                                        <DetailRow label="Reg. Number" value={item.registrationNumber} />
                                        <DetailRow label="Color" value={item.color} />
                                    </>
                                )}
                                {item.category === "JEWELRY" && (
                                    <>
                                        <DetailRow label="Purity" value={item.purity} />
                                        <DetailRow label="Weight" value={`${item.weight}g`} />
                                    </>
                                )}
                                <DetailRow label="Provenance" value={item.provenance || "Not provided"} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Controls & Actions */}
                <div className="space-y-6">
                    {/* Valuation Workflow Component */}
                    <div className="sticky top-6">
                        <ValuationControls
                            item={{
                                id: item.id,
                                valuationStatus: item.valuationStatus,
                                marketValue: item.marketValue ? Number(item.marketValue) : null,
                                finalValuation: item.finalValuation ? Number(item.finalValuation) : null,
                                userEstimatedValue: item.userEstimatedValue ? Number(item.userEstimatedValue) : null,
                                makerId: item.makerId,
                                rejectionReason: item.rejectionReason
                            }}
                            currentUserId={session?.user?.id || ""}
                        />

                        {/* User Card */}
                        <Card className="mt-6 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-900/50 border-b">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                    Customer Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                                            {item.User?.name || "Unknown User"}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">
                                                {item.User?.tier || "BRONZE"}
                                            </Badge>
                                            <span>Tier</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{item.User?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>{item.User?.phoneNumber || "No phone"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{item.User?.address || "No address"}</span>
                                    </div>
                                </div>

                                <Separator />

                                <Link href={`/admin/users/${item.User?.id}`} className="block">
                                    <Button variant="ghost" className="w-full text-xs text-slate-500">
                                        View Full Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
