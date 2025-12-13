"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Fragment } from "react"
import { Slash } from "lucide-react"

export function DashboardBreadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    // Map segments to cleaner titles if needed
    const segmentMap: Record<string, string> = {
        portal: "Portal",
        admin: "Admin",
        loans: "Loans",
        auctions: "Live Auctions",
        wallet: "My Wallet",
        profile: "Profile",
        items: "Inventory",
        users: "Users",
        reports: "Reports",
        valuations: "Valuations",
        audit: "Audit Log",
        payments: "Payments",
        dashboard: "Dashboard"
    }

    if (segments.length === 0) return null

    return (
        <Breadcrumb className="mb-4 hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <Slash />
                </BreadcrumbSeparator>
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    const href = `/${segments.slice(0, index + 1).join('/')}`
                    const title = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1) // Fallback capitalization

                    return (
                        <Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator>
                                    <Slash />
                                </BreadcrumbSeparator>
                            )}
                        </Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
