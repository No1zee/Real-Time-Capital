import { articles } from "@/lib/education-data"

export default function EducationPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Financial Education Hub</h1>
                <p className="text-muted-foreground">Expert advice on leveraging your assets, valuing items, and managing liquidity.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                    <Link href={`/portal/education/${article.slug}`} key={i}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 dark:border-slate-800 h-full">
                            <CardHeader>
                                <Badge className={`w-fit mb-2 ${article.color} border-none`}>{article.tag}</Badge>
                                <CardTitle className="text-xl">{article.title}</CardTitle>
                                <CardDescription>{article.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4">Read Article &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
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
