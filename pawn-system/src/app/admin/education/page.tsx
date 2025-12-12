"use server"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getArticles, deleteArticle, updateArticle } from "@/app/actions/cms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Plus, Edit2, Trash2, Globe, EyeOff } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function AdminContentPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        redirect("/portal")
    }

    const articles = await getArticles()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 id="admin-content-title" className="text-3xl font-bold tracking-tight">Education Hub</h1>
                    <p className="text-muted-foreground">Manage articles and guides for customers.</p>
                </div>
                <Link href="/admin/education/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Article
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Articles</CardTitle>
                    <CardDescription>
                        {articles.length} articles found.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No articles found. Create your first one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                articles.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">
                                            <div>{article.title}</div>
                                            <div className="text-xs text-muted-foreground font-mono">/{article.slug}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{article.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={article.published ? "success" : "secondary"}>
                                                {article.published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{article.Author.name}</TableCell>
                                        <TableCell>{format(article.updatedAt, "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/education/${article.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {/* Delete button would go here - using form action in a client component usually */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
