import { ArticleForm } from "@/components/admin/education/article-form"

export default function CreateArticlePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Article</h1>
                <p className="text-muted-foreground">Draft a new guide for the Knowledge Hub.</p>
            </div>

            <ArticleForm mode="create" />
        </div>
    )
}
