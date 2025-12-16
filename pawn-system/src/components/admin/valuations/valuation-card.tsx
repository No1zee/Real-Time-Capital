"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, ExternalLink, Package, User } from "lucide-react";
import Link from "next/link";

interface ValuationItem {
    id: string;
    name: string;
    description: string | null;
    status: string;
    valuationStatus: string;
    category: string;
    createdAt: Date;
    images: string; // JSON string
    User?: {
        name: string | null;
        email: string | null;
    } | null;
    userEstimatedValue: any; // Decimal
}

interface ValuationCardProps {
    item: ValuationItem;
}

export function ValuationCard({ item }: ValuationCardProps) {
    // Parse images safely
    let imageUrl = null;
    try {
        const images = JSON.parse(item.images || "[]");
        if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
        }
    } catch (e) { }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-slate-500";
            case "PENDING_MARKET_EVAL": return "bg-blue-500";
            case "MARKET_EVAL_COMPLETE": return "bg-indigo-500";
            case "PENDING_FINAL_OFFER": return "bg-purple-500";
            case "OFFER_READY": return "bg-amber-500";
            case "OFFER_ACCEPTED": return "bg-green-500";
            case "REJECTED": return "bg-red-500";
            default: return "bg-slate-500";
        }
    };

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
                    <Badge className={`${getStatusColor(item.valuationStatus)} text-white border-0 shadow-sm`}>
                        {item.valuationStatus}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-semibold text-base line-clamp-1" title={item.name}>
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{item.category}</Badge>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 flex-grow">
                <div className="mt-2 text-sm">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <User className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-slate-900 dark:text-slate-200">{item.User?.name || "Unknown User"}</p>
                            <p className="text-xs">{item.User?.email}</p>
                        </div>
                    </div>
                </div>
                {item.userEstimatedValue && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border text-xs">
                        <span className="text-slate-500">Client Estimate:</span>
                        <span className="font-medium ml-1 text-slate-900 dark:text-white">
                            {formatCurrency(Number(item.userEstimatedValue))}
                        </span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t mt-auto">
                <Link href={`/admin/valuations/${item.id}`} className="w-full">
                    <Button size="sm" className="w-full gap-2">
                        Assess Item
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
