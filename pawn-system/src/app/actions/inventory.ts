"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const sellItemSchema = z.object({
    itemId: z.string(),
    salePrice: z.coerce.number().positive("Sale price must be positive"),
})

export type InventoryState = {
    errors?: {
        salePrice?: string[]
    }
    message?: string | null
}

export async function markItemAsSold(prevState: InventoryState, formData: FormData) {
    const validatedFields = sellItemSchema.safeParse({
        itemId: formData.get("itemId"),
        salePrice: formData.get("salePrice"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid sale details.",
        }
    }

    const { itemId, salePrice } = validatedFields.data

    try {
        await db.item.update({
            where: { id: itemId },
            data: {
                status: "SOLD",
                salePrice,
                soldAt: new Date(),
            },
        })
    } catch (error) {
        console.error("Failed to sell item:", error)
        return { message: "Failed to record sale." }
    }

    revalidatePath("/inventory")
    return { message: "Item sold successfully!" }
}
