"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).default("CUSTOMER"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type RegisterState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        role?: string[]
    }
    message?: string
}

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        role: formData.get("role") || "CUSTOMER",
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Register.",
        }
    }

    const { name, email, password, role } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                message: "Email already in use.",
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        })

        return { message: "Registration successful! Please sign in." }

    } catch (error) {
        console.error("Registration error:", error)
        return { message: "Database Error: Failed to Register." }
    }
}

function isRedirectError(error: any) {
    return error?.digest?.startsWith("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT"
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const callbackUrl = formData.get("callbackUrl") as string || "/"
        await signIn("credentials", formData, { redirectTo: callbackUrl })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" })
}
