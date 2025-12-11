"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createArticle, updateArticle } from "@/app/actions/cms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const schema = z.object({
    title: z.string().min(5),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    content: z.string().min(20),
    category: z.string().min(1),
    published: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface ArticleFormProps {
    article?: any
    mode: "create" | "edit"
}

export function ArticleForm({ article, mode }: ArticleFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: article?.title || "",
            slug: article?.slug || "",
            description: article?.description || "",
            content: article?.content || "",
            category: article?.category || "Pawning 101",
            published: article?.published || false,
        }
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form

    // Auto-generate slug from title if in create mode
    const title = watch("title")
    if (mode === "create" && title && !form.getFieldState("slug").isDirty) {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        setValue("slug", slug)
    }

    async function onSubmit(data: FormData) {
        setIsSubmitting(true)
        try {
            let result
            if (mode === "create") {
                result = await createArticle(data)
            } else {
                result = await updateArticle(article.id, data)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(mode === "create" ? "Article created!" : "Article updated!")
                router.push("/admin/education")
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Article Title</Label>
                                <Input {...register("title")} placeholder="e.g., How to Pawn Gold" />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Slug (URL)</Label>
                                <Input {...register("slug")} placeholder="how-to-pawn-gold" />
                                {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Content (Markdown supported)</Label>
                                <Textarea
                                    {...register("content")}
                                    className="min-h-[400px] font-mono text-sm"
                                    placeholder="# Heading\n\nWrite your article content here..."
                                />
                                {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Publishing Status</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={watch("published")}
                                        onCheckedChange={(c) => setValue("published", c)}
                                    />
                                    <span className="text-sm font-medium">
                                        {watch("published") ? "Published (Visible)" : "Draft (Hidden)"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={watch("category")}
                                    onValueChange={(v) => setValue("category", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pawning 101">Pawning 101</SelectItem>
                                        <SelectItem value="Financial Tips">Financial Tips</SelectItem>
                                        <SelectItem value="Company News">Company News</SelectItem>
                                        <SelectItem value="Market Updates">Market Updates</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Textarea
                                    {...register("description")}
                                    placeholder="Brief summary for cards..."
                                    className="h-32"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {mode === "create" ? "Create Article" : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
