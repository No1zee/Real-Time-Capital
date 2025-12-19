"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ValuationCard } from "./valuation-card";
import { Search, LayoutGrid, List as ListIcon, Clock, Package, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ValuationViewProps {
    items: any[];
}

export function ValuationView({ items }: ValuationViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filter logic
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.User?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingReviewItems = filteredItems.filter(i =>
        (i.valuationStatus === "PENDING" || i.status === "PENDING_VALUATION") &&
        i.valuationStatus !== "PENDING_APPROVAL" &&
        i.valuationStatus !== "REJECTED_BY_CHECKER"
    );

    const pendingApprovalItems = filteredItems.filter(i =>
        i.valuationStatus === "PENDING_APPROVAL" || i.valuationStatus === "REJECTED_BY_CHECKER"
    );

    const marketEvalItems = filteredItems.filter(i =>
        i.valuationStatus === "PENDING_MARKET_EVAL" || i.valuationStatus === "MARKET_EVAL_COMPLETE"
    );

    const offerReadyItems = filteredItems.filter(i =>
        i.valuationStatus === "PENDING_FINAL_OFFER" || i.valuationStatus === "OFFER_READY"
    );

    const completedItems = filteredItems.filter(i =>
        i.valuationStatus === "OFFER_ACCEPTED" || i.valuationStatus === "REJECTED" || i.status === "VALUED"
    );

    const renderContent = (itemsToRender: any[]) => {
        if (viewMode === "grid") {
            return <ItemGrid items={itemsToRender} />;
        }
        return <ItemList items={itemsToRender} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search items or customers..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center border rounded-md bg-white dark:bg-slate-950 p-1">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewMode("list")}
                        title="List View"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
                    <TabsTrigger value="pending">Pending ({pendingReviewItems.length})</TabsTrigger>
                    <TabsTrigger value="approval">Approvals ({pendingApprovalItems.length})</TabsTrigger>
                    <TabsTrigger value="market">Market Eval ({marketEvalItems.length})</TabsTrigger>
                    <TabsTrigger value="offer">Offer Ready ({offerReadyItems.length})</TabsTrigger>
                    <TabsTrigger value="completed">History ({completedItems.length})</TabsTrigger>
                    <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="pending" className="mt-0">
                        {renderContent(pendingReviewItems)}
                    </TabsContent>
                    <TabsContent value="approval" className="mt-0">
                        {renderContent(pendingApprovalItems)}
                    </TabsContent>
                    <TabsContent value="market" className="mt-0">
                        {renderContent(marketEvalItems)}
                    </TabsContent>
                    <TabsContent value="offer" className="mt-0">
                        {renderContent(offerReadyItems)}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-0">
                        {renderContent(completedItems)}
                    </TabsContent>
                    <TabsContent value="all" className="mt-0">
                        {renderContent(filteredItems)}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function ItemGrid({ items }: { items: any[] }) {
    if (items.length === 0) {
        return <EmptyState />;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
                <ValuationCard key={item.id} item={item} />
            ))}
        </div>
    );
}

function ItemList({ items }: { items: any[] }) {
    if (items.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="border rounded-md bg-white dark:bg-slate-950 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <ValuationRow key={item.id} item={item} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function ValuationRow({ item }: { item: any }) {
    // Parse image safely for small thumbnail
    let imageUrl = null;
    try {
        const images = JSON.parse(item.images || "[]");
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-slate-500";
            case "PENDING_MARKET_EVAL": return "bg-blue-500";
            case "MARKET_EVAL_COMPLETE": return "bg-indigo-500";
            case "PENDING_FINAL_OFFER": return "bg-purple-500";
            case "PENDING_APPROVAL": return "bg-orange-500";
            case "OFFER_READY": return "bg-amber-500";
            case "OFFER_ACCEPTED": return "bg-green-500";
            case "REJECTED": return "bg-red-500";
            case "REJECTED_BY_CHECKER": return "bg-red-600";
            default: return "bg-slate-500";
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {imageUrl ? (
                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <Package className="h-5 w-5 text-slate-500" />
                        )}
                    </div>
                    <div>
                        <Link href={`/admin/valuations/${item.id}`} className="hover:underline font-medium block text-slate-900 dark:text-white line-clamp-1">
                            {item.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono">{item.category}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div>
                    <p className="text-sm font-medium">{item.User?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{item.User?.email}</p>
                </div>
            </TableCell>
            <TableCell>
                <span className="text-slate-500 text-sm">{formatDate(item.createdAt)}</span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(item.valuationStatus)} text-white border-0 hover:bg-opacity-90`}>
                        {item.valuationStatus.replace(/_/g, " ")}
                    </Badge>
                    {/* Show Maker Badge if waiting for approval */}
                    {item.valuationStatus === 'PENDING_APPROVAL' && (
                        <div title="Needs Approval">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Link href={`/admin/valuations/${item.id}`}>
                    <Button variant="ghost" size="sm" className="h-8">
                        Assess
                    </Button>
                </Link>
            </TableCell>
        </TableRow>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No valuation items found in this stage.</p>
        </div>
    );
}
