import Link from "next/link"
import { getArticles } from "@/app/actions/cms"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen } from "lucide-react"
import { format } from "date-fns"

export default async function EducationPage() {
    const articles = await getArticles({ published: true })

    return (
        <div className="container py-8 space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Knowledge Hub</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Learn everything you need to know about pawning, valuations, and financial management with Cashpoint.
                </p>
            </div>

            {/* Featured Section could go here */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No articles available yet. Check back soon!</p>
                    </div>
                ) : (
                    articles.map((article) => (
                        <Link href={`/portal/education/${article.slug}`} key={article.id} className="group">
                            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                                {article.coverImage && (
                                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted relative">
                                        {/* Image would go here */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <Badge className="absolute bottom-3 left-3">{article.category}</Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    {!article.coverImage && <Badge className="w-fit mb-2">{article.category}</Badge>}
                                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {article.description || "No description available."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground flex items-center justify-between mt-auto">
                                        <span>{article.Author.name}</span>
                                        <span>{format(article.createdAt, "MMM d, yyyy")}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <h3 className="text-xl font-bold mb-4">Have a specific question?</h3>
                <p className="text-muted-foreground mb-6">Our financial experts are available for a detailed consultation regarding your high-value assets.</p>
                <Link href="/portal/contact" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">
                    Contact an Expert
                </Link>
            </div>
        </div>
    )
}
