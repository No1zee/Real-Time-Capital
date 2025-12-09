"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

// Password Regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be valid"),
    nationalId: z.string().min(5, "National ID is required"),
    address: z.string().min(5, "Address is required"),
    location: z.string().min(2, "Location is required"),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    password: z.string().regex(passwordRegex, "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).default("CUSTOMER"),
    terms: z.string().refine((val) => val === "on", "You must accept the Terms & Conditions"),
    idImage: z.instanceof(File, { message: "ID Document is required" })
        .refine((file) => file.size < 5 * 1024 * 1024, "File size must be less than 5MB")
        .refine((file) => ["image/jpeg", "image/png", "application/pdf"].includes(file.type), "Only JPG, PNG, or PDF allowed"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type RegisterState = {
    errors?: {
        name?: string[]
        email?: string[]
        phoneNumber?: string[]
        nationalId?: string[]
        address?: string[]
        location?: string[]
        dateOfBirth?: string[]
        password?: string[]
        confirmPassword?: string[]
        terms?: string[]
        idImage?: string[]
    }
    message?: string
}

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const validatedFields = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phoneNumber: formData.get("phoneNumber"),
        nationalId: formData.get("nationalId"),
        address: formData.get("address"),
        location: formData.get("location"),
        dateOfBirth: formData.get("dateOfBirth"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        role: formData.get("role") || "CUSTOMER",
        terms: formData.get("terms"),
        idImage: formData.get("idImage"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation Failed. Please check your inputs.",
        }
    }

    const { name, email, password, role, phoneNumber, nationalId, address, location, dateOfBirth, idImage } = validatedFields.data

    try {
        // Check strict uniqueness
        const existingEmail = await prisma.user.findUnique({ where: { email } })
        if (existingEmail) return { message: "Email already in use. Please log in." }

        const existingPhone = await prisma.user.findFirst({ where: { phoneNumber } })
        if (existingPhone) return { message: "Phone number already registered." }

        const existingId = await prisma.user.findFirst({ where: { nationalId } })
        if (existingId) return { message: "National ID already registered." }

        // Handle File Upload
        const bytes = await idImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uploadDir = join(process.cwd(), "public", "uploads", "kyc")
        await mkdir(uploadDir, { recursive: true })

        const fileName = `${randomUUID()}-${idImage.name}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)
        const publicPath = `/uploads/kyc/${fileName}`

        const hashedPassword = await bcrypt.hash(password, 10)

        // Generate Verification Token
        const verificationToken = randomUUID()
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Create User
        await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                nationalId,
                address,
                location,
                dateOfBirth: new Date(dateOfBirth),
                password: hashedPassword,
                role: role as "CUSTOMER" | "STAFF" | "ADMIN",
                idImage: publicPath,
                termsAccepted: true,
                verificationStatus: "PENDING", // Wait for verification
                emailVerified: null,
            },
        })

        // Save Token (Using existing VerificationToken model if available, or just mock logic if model differs)
        // Schema has VerificationToken model: identifier, token, expires.
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: verificationToken,
                expires: tokenExpiry
            }
        })

        // Mock Send Email
        console.log("==========================================")
        console.log(`[MOCK EMAIL] TO: ${email}`)
        console.log(`SUBJECT: Verify your account`)
        console.log(`LINK: http://localhost:3000/verify-email?token=${verificationToken}`)
        console.log("==========================================")

        return { message: "Registration successful! check your server console for the verification link." }

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
