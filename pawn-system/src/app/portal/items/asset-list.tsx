"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Package, Plus, AlertCircle, CheckCircle, Clock, Search, Filter } from "lucide-react"


interface AssetListProps {
    items: {
        id: string
        name: string
        description: string | null
        category: string
        status: string
        valuationStatus: string | null
        userEstimatedValue: any // Decimal
        valuation: any // Decimal
        images: string
        createdAt: Date
        Loan: { id: string; status: string } | null
    }[]
}

export function AssetList({ items }: AssetListProps) {
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState("active")

    // Helper: Determine if item is "Active" or "History"
    const isActive = (status: string) => {
        return ["PENDING_VALUATION", "ACTIVE_LOAN", "IN_AUCTION"].includes(status)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())

        const isItemActive = isActive(item.status)
        const matchesTab = activeTab === "active" ? isItemActive : !isItemActive

        return matchesSearch && matchesTab
    })

    const getStatusBadge = (status: string, valuationStatus: string | null) => {
        if (status === "PENDING_VALUATION") {
            if (valuationStatus === "PENDING_MARKET_EVAL")
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> In Review</Badge>
            if (valuationStatus === "PENDING_FINAL_OFFER")
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Initial Offer Ready</Badge>
            if (valuationStatus === "OFFER_ACCEPTED")
                return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Offer Accepted</Badge>
            if (valuationStatus === "REJECTED")
                return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
        }

        if (status === "ACTIVE_LOAN") return <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">Active Loan</Badge>
        if (status === "REDEEMED") return <Badge variant="outline" className="border-green-600 text-green-600">Redeemed</Badge>
        if (status === "IN_AUCTION") return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">In Auction</Badge>
        if (status === "SOLD") return <Badge variant="secondary">Sold</Badge>

        return <Badge variant="outline">{status}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assets..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Tabs defaultValue="active" className="w-full md:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active">Active Assets</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                    let imageUrl = "/placeholder-item.jpg"
                    try {
                        const parsed = JSON.parse(item.images as string)
                        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0]
                    } catch (e) { }

                    return (
                        <Card key={item.id} className="overflow-hidden bg-card border-border flex flex-col hover:shadow-lg transition-all group">
                            <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(item.status, item.valuationStatus)}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-white font-medium text-sm">View Details →</span>
                                </div>
                            </div>

                            <CardHeader className="p-4 pb-2">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-semibold line-clamp-1" title={item.name}>
                                            {item.name}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground font-mono">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <CardDescription className="capitalize text-xs">
                                        {item.category.toLowerCase().replace("_", " ")}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-2 space-y-4 flex-1 flex flex-col justify-end">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center py-2 border-t border-border/50">
                                        <span className="text-muted-foreground">Estimated Value</span>
                                        <span className="font-semibold text-foreground">
                                            {formatCurrency(Number(item.userEstimatedValue || 0))}
                                        </span>
                                    </div>

                                    {(Number(item.valuation) > 0) && (
                                        <div className="bg-primary/5 p-2 rounded-lg flex justify-between items-center border border-primary/10">
                                            <span className="text-primary font-medium text-xs">Official Offer</span>
                                            <span className="text-primary font-bold">
                                                {formatCurrency(Number(item.valuation))}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link href={`/portal/items/${item.id}`} className="w-full">
                                    <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50 transition-colors">
                                        Manage Asset
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}

                {filteredItems.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No {activeTab} items found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mb-6">
                            {activeTab === "active"
                                ? "You don't have any active assets. Start by getting a valuation for a new item."
                                : "No history available yet."}
                        </p>
                        {activeTab === "active" && (
                            <Link href="/portal/pawn">
                                <Button size="lg" className="bg-primary text-primary-foreground">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Register New Asset
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
