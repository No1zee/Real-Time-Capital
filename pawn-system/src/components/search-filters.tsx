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

    const [isExpanded, setIsExpanded] = useState(false)

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
        setIsExpanded(false) // Collapse after searching to save space
    }

    const handleReset = () => {
        setQuery("")
        setCategory("All")
        setMinPrice("")
        setMaxPrice("")
        setSort("ending_soon")
        router.push("/portal/auctions")
        setIsExpanded(false)
    }

    return (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Filter & Sort</span>
                    {(query || category !== "All" || minPrice || maxPrice) && (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                    )}
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Search className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90 text-amber-500" : "text-slate-400"}`} />
                </Button>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
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
            )}
        </div>
    )
}
