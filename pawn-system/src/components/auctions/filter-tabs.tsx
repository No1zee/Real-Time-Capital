"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FilterTabs() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get("category") || "ALL"

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === "ALL") {
            params.delete("category")
        } else {
            params.set("category", value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Tabs defaultValue={currentCategory} onValueChange={handleValueChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="VEHICLE">Vehicles</TabsTrigger>
                <TabsTrigger value="PROPERTY">Properties</TabsTrigger>
                <TabsTrigger value="GOODS">Goods</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
