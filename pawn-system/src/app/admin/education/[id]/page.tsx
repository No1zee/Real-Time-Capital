import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ArticleForm } from "@/components/admin/education/article-form"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: PageProps) {
    const { id } = await params

    // Direct prisma call in server component is fine, or use getArticle action
    const article = await prisma.article.findUnique({
        where: { id }
    })

    if (!article) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
                <p className="text-muted-foreground">Update content for "{article.title}".</p>
            </div>

            <ArticleForm mode="edit" article={article} />
        </div>
    )
}
