"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, Gavel, Package, Printer } from "lucide-react";
import Link from "next/link";
import { markItemDefaulted, moveItemToAuction } from "@/app/actions/admin/inventory";
import { toast } from "sonner";
import { useTransition } from "react";

// Define the type based on the Prisma return type we observed
interface InventoryItem {
    id: string;
    name: string;
    description: string | null;
    status: string;
    valuation: any; // Prisma Decimal
    createdAt: Date;
    updatedAt: Date;
    loanId: string | null;
    images: string; // JSON string
    Loan?: {
        id: string;
        status: string;
    } | null;
    Auction?: any | null;
}

interface InventoryCardProps {
    item: InventoryItem;
}

export function InventoryCard({ item }: InventoryCardProps) {
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

    // Parse images safely
    let imageUrl = null;
    try {
        const images = JSON.parse(item.images || "[]");
        if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
        }
    } catch (e) {
        // Fallback if parsing fails
    }

    return (
        <Card className="hover:shadow-md transition-shadow dark:bg-slate-950/50 overflow-hidden flex flex-col h-full">
            <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-900 border-b">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={
                        item.status === "SOLD" ? "default" :
                            item.status === "IN_AUCTION" ? "destructive" :
                                "outline"
                    } className="bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-sm">
                        {item.status}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <Link href={`/admin/valuations/${item.id}`} className="hover:underline font-semibold block text-base line-clamp-1" title={item.name}>
                            {item.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{item.id.slice(0, 8)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 flex-grow">
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Valuation</p>
                        <p className="font-medium">{formatCurrency(Number(item.valuation))}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Loan Status</p>
                        {item.Loan ? (
                            <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${item.Loan.status === "ACTIVE" ? "bg-green-500" :
                                    item.Loan.status === "DEFAULTED" ? "bg-red-500" : "bg-slate-300"
                                    }`} />
                                <span className="text-slate-700 dark:text-slate-300">{item.Loan.status}</span>
                            </div>
                        ) : (
                            <span className="text-slate-400 italic">None</span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-end gap-2 mt-auto">
                {/* Action: Default Loan */}
                {item.Loan?.status === "ACTIVE" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
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
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/20"
                            title="Move to Auction"
                            onClick={handleMoveToAuction}
                            disabled={isPending}
                        >
                            <Gavel className="h-4 w-4 text-amber-500" />
                        </Button>
                    )
                )}

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Print Label" disabled>
                    <Printer className="h-4 w-4 text-slate-400" />
                </Button>
            </CardFooter>
        </Card>
    );
}
