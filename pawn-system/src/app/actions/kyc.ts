"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function submitKYC(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) throw new Error("User not found")

    // In a real app, we would upload the file to S3/Blob storage here.
    // For this prototype, we'll simulate it by accepting a URL or base64 string
    // passed via a hidden input or just assume the 'file' input is handled by a client-side uploader 
    // that returns a URL.
    // To keep it simple and self-contained without external storage:
    // We will accept a "mock" URL or if the user provides a link.
    // Or better, let's just simulate the upload delay and store a placeholder if no real file handling is set up.

    // However, to make it "real" enough, let's assume the client converts file to base64 (not recommended for large files but fine for MVP)
    // or just stores a dummy path if we don't want to implement full file upload logic now.

    // Let's use a dummy path for now to unblock the flow, as file upload requires S3/Vercel Blob setup.
    const idImage = "https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=800&q=80" // Placeholder ID image

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationStatus: "PENDING",
            idImage: idImage,
            verificationNote: null
        }
    })

    revalidatePath("/portal/profile")
}

export async function verifyUser(userId: string, action: "APPROVE" | "REJECT", note?: string) {
    const session = await auth()
    const currentUser = session?.user as any

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationStatus: action === "APPROVE" ? "VERIFIED" : "REJECTED",
            verificationNote: note
        }
    })

    revalidatePath("/admin/dashboard")
}

export async function getPendingVerifications() {
    const session = await auth()
    const currentUser = session?.user as any

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    return await prisma.user.findMany({
        where: { verificationStatus: "PENDING" },
        select: {
            id: true,
            name: true,
            email: true,
            idImage: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    })
}
