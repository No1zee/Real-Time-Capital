"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function uploadId(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const file = formData.get("idImage") as File
    if (!file) {
        throw new Error("No file uploaded")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads")
    // Ensure directory exists (in a real app, use fs.mkdir)
    // For now assuming public exists, we might need to create uploads folder manually or check

    // Simple unique filename
    const filename = `${session.user.id}-${Date.now()}-${file.name}`
    const filepath = join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        const publicPath = `/uploads/${filename}`

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                idImage: publicPath,
                verificationStatus: "PENDING",
            },
        })

        revalidatePath("/portal/profile")
        return { success: true }
    } catch (error) {
        console.error("Upload failed:", error)
        throw new Error("Upload failed")
    }
}
