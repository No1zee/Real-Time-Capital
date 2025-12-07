"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ITEM_CATEGORIES } from "@/lib/constants"
import { Search, X } from "lucide-react"

export function SearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get("query") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "All")
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
    const [sort, setSort] = useState(searchParams.get("sort") || "ending_soon")

    // Update state when URL params change (e.g. back button)
    useEffect(() => {
        setQuery(searchParams.get("query") || "")
        setCategory(searchParams.get("category") || "All")
        setMinPrice(searchParams.get("minPrice") || "")
        setMaxPrice(searchParams.get("maxPrice") || "")
        setSort(searchParams.get("sort") || "ending_soon")
    }, [searchParams])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (query) params.set("query", query)
        if (category && category !== "All") params.set("category", category)
        if (minPrice) params.set("minPrice", minPrice)
        if (maxPrice) params.set("maxPrice", maxPrice)
        if (sort) params.set("sort", sort)

        router.push(`/portal/auctions?${params.toString()}`)
    }

    const handleReset = () => {
        setQuery("")
        setCategory("All")
        setMinPrice("")
        setMaxPrice("")
        setSort("ending_soon")
        router.push("/portal/auctions")
    }

    return (
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            id="search"
                            placeholder="Search items..."
                            className="pl-9"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {ITEM_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Min"
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-slate-500">-</span>
                        <Input
                            placeholder="Max"
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ending_soon">Ending Soonest</SelectItem>
                            <SelectItem value="newly_listed">Newly Listed</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                    <X className="w-4 h-4" />
                    Reset
                </Button>
                <Button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                    <Search className="w-4 h-4" />
                    Apply Filters
                </Button>
            </div>
        </div>
    )
}
