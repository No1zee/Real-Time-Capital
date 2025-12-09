"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: LucideIcon
    trend?: {
        value: number
        direction: "up" | "down" | "neutral"
    }
    className?: string
}

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className = ""
}: MetricCardProps) {
    return (
        <Card className={`glass-card ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-slate-500" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white mb-1">
                    {value}
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-400">{subtitle}</p>
                )}
                {trend && (
                    <div className={`text-xs mt-2 flex items-center gap-1 ${trend.direction === "up" ? "text-green-500" :
                            trend.direction === "down" ? "text-red-500" :
                                "text-slate-400"
                        }`}>
                        {trend.direction === "up" && "↑"}
                        {trend.direction === "down" && "↓"}
                        {trend.direction === "neutral" && "→"}
                        <span>{Math.abs(trend.value).toFixed(1)}%</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
