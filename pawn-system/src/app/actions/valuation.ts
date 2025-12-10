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
    const typeStr = formData.get("category") as string
    const condition = formData.get("condition") as "NEW" | "LIKE_NEW" | "USED" | "DAMAGED" || "USED"
    const yearOfPurchase = formData.get("yearOfPurchase") ? parseInt(formData.get("yearOfPurchase") as string) : null
    const userEstimatedValue = formData.get("estimatedValue") ? parseFloat(formData.get("estimatedValue") as string) : null

    // Asset Type Mapping
    let category: "JEWELRY" | "ELECTRONICS" | "VEHICLE" | "COLLECTIBLE" | "FURNITURE" | "OTHER" = "OTHER"
    if (["JEWELRY", "ELECTRONICS", "VEHICLE", "COLLECTIBLE", "FURNITURE", "OTHER"].includes(typeStr)) {
        category = typeStr as any
    }

    // Dynamic Fields Extraction
    const vin = formData.get("vin") as string
    const mileage = formData.get("mileage") ? parseInt(formData.get("mileage") as string) : null
    const engineNumber = formData.get("engineNumber") as string
    const chassisNumber = formData.get("chassisNumber") as string
    const registrationNumber = formData.get("registrationNumber") as string
    const color = formData.get("color") as string

    const purity = formData.get("purity") as string
    const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null
    const dimensions = formData.get("dimensions") as string
    const provenance = formData.get("provenance") as string

    // Basic Validation
    if (!name || name.length < 3) {
        return { message: "Validation Failed", errors: { name: ["Name must be at least 3 characters"] } }
    }
    if (!description || description.length < 10) {
        return { message: "Validation Failed", errors: { description: ["Description must be detailed (min 10 chars)"] } }
    }

    // Capture "Images" (Mocked for now)
    const mockImages = ["/placeholder-item.jpg"]

    try {
        const item = await prisma.item.create({
            data: {
                id: crypto.randomUUID(),
                name,
                description,
                category, // Enum
                type: typeStr, // String backup
                condition,
                yearOfPurchase,
                userEstimatedValue,

                // Vehicle
                vin,
                engineNumber,
                chassisNumber,
                registrationNumber,
                mileage,
                color,

                // Jewelry
                purity,
                weight,

                // Others
                dimensions,
                provenance,

                valuation: 0,
                userId: session.user.id,
                status: "PENDING_VALUATION",
                valuationStatus: "PENDING_MARKET_EVAL", // Start workflow
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
        return { message: "success" }
    } catch (error) {
        console.error("Valuation Submission Error:", error)
        return { message: "Failed to submit request. Please try again." }
    }
}

export async function updateValuation(
    itemId: string,
    amount: number,
    type: "market-value" | "final-offer"
) {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    try {
        let updateData: any = {}
        let nextStatus = ""
        let actionType = ""

        if (type === "market-value") {
            updateData = {
                marketValue: amount,
                valuationStatus: "PENDING_FINAL_OFFER"
            }
            nextStatus = "PENDING_FINAL_OFFER"
            actionType = "SET_MARKET_VALUE"
        } else if (type === "final-offer") {
            updateData = {
                finalValuation: amount,
                valuation: amount, // Also set main valuation field for consistency
                valuationStatus: "OFFER_READY" // New status for user review
            }
            nextStatus = "OFFER_READY"
            actionType = "SET_FINAL_OFFER"
        }

        const item = await prisma.item.update({
            where: { id: itemId },
            data: updateData
        })

        await logAudit({
            userId: session.user.id as string,
            action: "UPDATE",
            entityType: "ITEM",
            entityId: itemId,
            details: {
                amount,
                type,
                previousStatus: item.valuationStatus,
                newStatus: nextStatus
            }
        })

        revalidatePath("/admin/valuations")
        revalidatePath(`/admin/valuations/${itemId}`)
        return { success: true }
    } catch (error) {
        console.error("Valuation Update Error:", error)
        return { success: false, error: "Failed to update valuation" }
    }
}
