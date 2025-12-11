"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema
const articleSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    content: z.string().min(20, "Content must be at least 20 characters"),
    category: z.string().min(1, "Category is required"),
    published: z.boolean().default(false),
})

export async function createArticle(data: z.infer<typeof articleSchema>) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        return { error: "Unauthorized" }
    }

    const validated = articleSchema.safeParse(data)
    if (!validated.success) {
        return { error: "Validation failed", details: validated.error.flatten() }
    }

    try {
        const article = await db.article.create({
            data: {
                ...validated.data,
                authorId: session.user.id!,
            }
        })

        revalidatePath("/admin/education")
        revalidatePath("/portal/education")
        return { success: true, article }
    } catch (error) {
        console.error("Failed to create article:", error)
        return { error: "Failed to create article" }
    }
}

export async function updateArticle(id: string, data: Partial<z.infer<typeof articleSchema>>) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        return { error: "Unauthorized" }
    }

    try {
        const article = await db.article.update({
            where: { id },
            data
        })

        revalidatePath("/admin/education")
        revalidatePath("/portal/education")
        return { success: true, article }
    } catch (error) {
        console.error("Failed to update article:", error)
        return { error: "Failed to update article" }
    }
}

export async function deleteArticle(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        await db.article.delete({ where: { id } })
        revalidatePath("/admin/education")
        revalidatePath("/portal/education")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete article:", error)
        return { error: "Failed to delete article" }
    }
}

export async function getArticles(filter: { published?: boolean, category?: string } = {}) {
    try {
        const articles = await db.article.findMany({
            where: filter,
            orderBy: { createdAt: "desc" },
            include: { Author: { select: { name: true, email: true } } }
        })
        return articles
    } catch (error) {
        console.error("Failed to fetch articles:", error)
        return []
    }
}

export async function getArticleBySlug(slug: string) {
    try {
        const article = await db.article.findUnique({
            where: { slug },
            include: { Author: { select: { name: true } } }
        })
        return article
    } catch (error) {
        console.error("Failed to fetch article:", error)
        return null
    }
}
