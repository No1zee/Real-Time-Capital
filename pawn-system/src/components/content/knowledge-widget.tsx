import Link from "next/link"
import { getArticles } from "@/app/actions/cms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowRight } from "lucide-react"

interface KnowledgeWidgetProps {
    category?: string
    limit?: number
    title?: string
    className?: string
}

export async function KnowledgeWidget({ category, limit = 3, title = "Related Knowledge", className }: KnowledgeWidgetProps) {
    const articles = await getArticles({ category, published: true })
    const displayArticles = articles.slice(0, limit)

    if (displayArticles.length === 0) return null

    return (
        <Card className={`glass-panel border-cyan-100 dark:border-cyan-900/30 overflow-hidden ${className}`}>
            <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {displayArticles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/portal/education/${article.slug}`}
                            className="block p-4 hover:bg-muted/50 transition-colors group"
                        >
                            <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                {article.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {article.description}
                            </p>
                            <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                Read Guide <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="p-3 bg-muted/30 border-t border-border/50 text-center">
                    <Link href="/portal/education" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                        View Knowledge Hub
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
