"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/logger"

export type ValuationState = {
    message: string | null
    errors?: {
        name?: string[]
        description?: string[]
        category?: string[]
    }
}

export async function submitValuationRequest(prevState: ValuationState, formData: FormData): Promise<ValuationState> {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: "Unauthorized. Please login to submit a request." }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    // Basic Validation
    if (!name || name.length < 3) {
        return { message: "Validation Failed", errors: { name: ["Name must be at least 3 characters"] } }
    }
    if (!description || description.length < 10) {
        return { message: "Validation Failed", errors: { description: ["Description must be detailed (min 10 chars)"] } }
    }

    // Capture "Images" (Mocked for now as per plan, just taking names or simple string)
    // In real app, we'd upload to S3/Blob here.
    const imageFiles = formData.getAll("images") // Placeholder for future logic
    const mockImages = ["/placeholder-item.jpg"] // Using placeholder for now

    try {
        const item = await prisma.item.create({
            data: {
                id: crypto.randomUUID(),
                name,
                description,
                category,
                valuation: 0, // 0 indicates Pending
                userId: session.user.id,
                status: "PENDING_VALUATION",
                images: JSON.stringify(mockImages),
                location: "Digital Inventory",
                updatedAt: new Date(),
            }
        })

        await logAudit({
            userId: session.user.id,
            action: "CREATE",
            entityType: "ITEM",
            entityId: item.id,
            details: { name, category, status: "PENDING_VALUATION" }
        })

        revalidatePath("/portal")
        revalidatePath("/portal/activities")
        return { message: "success" } // Frontend looks for "success" string
    } catch (error) {
        console.error("Valuation Submission Error:", error)
        return { message: "Failed to submit request. Please try again." }
    }
}

export async function updateValuation(itemId: string, valuationAmount: number) {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        const item = await prisma.item.update({
            where: { id: itemId },
            data: {
                valuation: valuationAmount,
                status: "VALUED"
            }
        })

        await logAudit({
            userId: session.user.id as string,
            action: "UPDATE",
            entityType: "ITEM",
            entityId: itemId,
            details: { valuation: valuationAmount, status: "VALUED" }
        })

        revalidatePath("/admin/valuations")
        return { success: true }
    } catch (error) {
        console.error("Valuation Update Error:", error)
        return { success: false, error: "Failed to update valuation" }
    }
}
