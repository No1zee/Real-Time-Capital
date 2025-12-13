import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("text-center py-12 md:py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted", className)}>
            <div className="max-w-md mx-auto px-4">
                {Icon && (
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base">
                    {description}
                </p>
                {actionLabel && actionHref && (
                    <Button asChild>
                        <Link href={actionHref}>
                            {actionLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
