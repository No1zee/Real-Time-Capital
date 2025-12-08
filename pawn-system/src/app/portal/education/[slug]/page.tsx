import { articles } from "@/lib/education-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const article = articles.find(a => a.slug === params.slug)

    if (!article) {
        return notFound()
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link href="/portal/education">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
                </Button>
            </Link>

            <div className="space-y-4">
                <Badge className={`w-fit ${article.color} border-none`}>{article.tag}</Badge>
                <h1 className="text-4xl font-extrabold tracking-tight">{article.title}</h1>
                <p className="text-xl text-muted-foreground">{article.subtitle}</p>
            </div>

            <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
                <h3 className="font-bold mb-4">Ready to unlock value?</h3>
                <Link href="/portal/loans/apply">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                        Apply for a Loan Now
                    </Button>
                </Link>
            </div>
        </div>
    )
}
