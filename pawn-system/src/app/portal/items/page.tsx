import { getUserItems } from "@/app/actions/item"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { KnowledgeWidget } from "@/components/content/knowledge-widget"
import { AssetList } from "./asset-list"

export const dynamic = "force-dynamic"

export default async function UserInventoryPage() {
    const items = await getUserItems()

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 id="user-inventory-title" className="text-3xl font-bold tracking-tight text-foreground">My Items</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your submitted assets, valuations, and auction history.
                    </p>
                </div>
                <Link href="/portal/pawn">
                    <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Pawn New Item
                    </Button>
                </Link>
            </div>

            <AssetList items={items} />

            <div className="mt-8">
                <KnowledgeWidget category="valuations" title="Valuation Tips" limit={3} />
            </div>
        </div>
    )
}
