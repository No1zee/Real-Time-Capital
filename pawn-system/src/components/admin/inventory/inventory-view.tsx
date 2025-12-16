"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "./inventory-card";
import { Search, LayoutGrid, List as ListIcon, Package, AlertTriangle, Gavel, Printer } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { markItemDefaulted, moveItemToAuction } from "@/app/actions/admin/inventory";
import { toast } from "sonner";

interface InventoryViewProps {
    items: any[]; // Using any[] for simplicity with the complex Prisma types passed from server
}

export function InventoryView({ items }: InventoryViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filter logic
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inVaultItems = filteredItems.filter(i =>
        (i.status === "VALUED" || i.status === "PAWNED") && (!i.Loan || i.Loan.status !== "ACTIVE")
    );

    // Active loans are items technically "in vault" but held as collateral
    const activeLoanItems = filteredItems.filter(i => i.Loan?.status === "ACTIVE");

    const auctionItems = filteredItems.filter(i => i.status === "IN_AUCTION");
    const soldItems = filteredItems.filter(i => i.status === "SOLD");

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
                        placeholder="Search items..."
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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                    <TabsTrigger value="all">All Items ({filteredItems.length})</TabsTrigger>
                    <TabsTrigger value="vault">In Vault ({inVaultItems.length})</TabsTrigger>
                    <TabsTrigger value="loans">Active Loans ({activeLoanItems.length})</TabsTrigger>
                    <TabsTrigger value="auction">Auction ({auctionItems.length})</TabsTrigger>
                    <TabsTrigger value="sold">Sold ({soldItems.length})</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="all" className="mt-0">
                        {renderContent(filteredItems)}
                    </TabsContent>
                    <TabsContent value="vault" className="mt-0">
                        {renderContent(inVaultItems)}
                    </TabsContent>
                    <TabsContent value="loans" className="mt-0">
                        {renderContent(activeLoanItems)}
                    </TabsContent>
                    <TabsContent value="auction" className="mt-0">
                        {renderContent(auctionItems)}
                    </TabsContent>
                    <TabsContent value="sold" className="mt-0">
                        {renderContent(soldItems)}
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
                <InventoryCard key={item.id} item={item} />
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
                        <TableHead>Valuation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Loan Info</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <InventoryRow key={item.id} item={item} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function InventoryRow({ item }: { item: any }) {
    const [isPending, startTransition] = useTransition();

    const handleMarkDefaulted = () => {
        startTransition(async () => {
            try {
                await markItemDefaulted(item.id);
                toast.success("Loan marked as defaulted");
            } catch (error) {
                toast.error("Failed to mark defaulted");
            }
        });
    };

    const handleMoveToAuction = () => {
        startTransition(async () => {
            try {
                await moveItemToAuction(item.id);
                toast.success("Item moved to auction");
            } catch (error) {
                toast.error("Failed to move to auction");
            }
        });
    };

    // Parse image safely for small thumbnail
    let imageUrl = null;
    try {
        const images = JSON.parse(item.images || "[]");
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

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
                        <p className="text-xs text-slate-500 font-mono">{item.id.slice(0, 8)}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                {formatCurrency(Number(item.valuation))}
            </TableCell>
            <TableCell>
                <Badge variant={
                    item.status === "SOLD" ? "default" :
                        item.status === "IN_AUCTION" ? "destructive" :
                            "outline"
                }>
                    {item.status}
                </Badge>
            </TableCell>
            <TableCell>
                {item.Loan ? (
                    <div className="text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${item.Loan.status === "ACTIVE" ? "bg-green-500" :
                                item.Loan.status === "DEFAULTED" ? "bg-red-500" : "bg-slate-300"
                                }`} />
                            <span>{item.Loan.status}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 text-xs italic">None</span>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    {/* Action: Default Loan */}
                    {item.Loan?.status === "ACTIVE" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                            title="Mark Loan as Defaulted"
                            onClick={handleMarkDefaulted}
                            disabled={isPending}
                        >
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </Button>
                    )}

                    {/* Action: Move to Auction */}
                    {item.status !== "IN_AUCTION" && item.status !== "SOLD" && (
                        (!item.loanId || item.Loan?.status === "DEFAULTED") && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/20"
                                title="Move to Auction"
                                onClick={handleMoveToAuction}
                                disabled={isPending}
                            >
                                <Gavel className="h-4 w-4 text-amber-500" />
                            </Button>
                        )
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Print Label" disabled>
                        <Printer className="h-4 w-4 text-slate-400" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No items found in this category.</p>
        </div>
    );
}
