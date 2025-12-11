"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileAdminHeaderProps {
    title: string
    backHref: string
}

export function MobileAdminHeader({ title, backHref }: MobileAdminHeaderProps) {
    return (
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
                <Link href={backHref}>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            </div>
        </div>
    )
}
