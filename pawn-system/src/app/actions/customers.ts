"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const customerSchema = z.object({
    id: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    nationalId: z.string().min(1, "National ID is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
})

export type CustomerState = {
    errors?: {
        firstName?: string[]
        lastName?: string[]
        nationalId?: string[]
        phoneNumber?: string[]
        email?: string[]
        address?: string[]
    }
    message?: string | null
}

export async function updateCustomer(prevState: CustomerState, formData: FormData) {
    const validatedFields = customerSchema.safeParse({
        id: formData.get("id"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        nationalId: formData.get("nationalId"),
        phoneNumber: formData.get("phoneNumber"),
        email: formData.get("email"),
        address: formData.get("address"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid customer details.",
        }
    }

    const { id, firstName, lastName, nationalId, phoneNumber, email, address } = validatedFields.data

    try {
        await db.customer.update({
            where: { id },
            data: {
                firstName,
                lastName,
                nationalId,
                phoneNumber,
                email,
                address,
            },
        })
    } catch (error) {
        console.error("Failed to update customer:", error)
        return { message: "Failed to update customer." }
    }

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { message: "Customer updated successfully!" }
}
