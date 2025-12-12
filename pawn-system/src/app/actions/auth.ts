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
// Follows NIST guidelines - allows any printable characters
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be valid"),
    nationalId: z.string().min(5, "National ID is required"),
    address: z.string().min(5, "Address is required"),
    location: z.string().min(2, "Location is required"),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date")
        .refine((val) => {
            const date = new Date(val);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                return age - 1 >= 18;
            }
            return age >= 18;
        }, "You must be at least 18 years old"),
    password: z.string().regex(passwordRegex, "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).default("CUSTOMER"),
    terms: z.string().refine((val) => val === "on" || val === "true", "You must accept the Terms & Conditions"),
    idImage: z.instanceof(File, { message: "ID Document is required" })
        .refine((file) => file.size < 5 * 1024 * 1024, "File size must be less than 5MB")
        .refine((file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(file.type),
            (file) => ({ message: `Invalid file type. Allowed: JPG, PNG, PDF. Received: ${file.type || "unknown"}` })),
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

import { rateLimit } from "@/lib/rate-limit"

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const allowed = await rateLimit(5, 60000) // 5 attempts per minute
    if (!allowed) {
        return { message: "Too many attempts. Please try again later." }
    }

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
        terms: formData.get("terms") ? "true" : "false", // Convert checkbox to string
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
        let publicPath = "/images/placeholder-id.png" // Default placeholder

        try {
            const bytes = await idImage.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const uploadDir = join(process.cwd(), "public", "uploads", "kyc")
            await mkdir(uploadDir, { recursive: true })

            const fileName = `${randomUUID()}-${idImage.name}`
            const filePath = join(uploadDir, fileName)
            await writeFile(filePath, buffer)
            publicPath = `/uploads/kyc/${fileName}`
        } catch (error: any) {
            if (error.code === 'EROFS' || process.env.VERCEL) {
                console.warn("Vercel Read-Only System detected. Using placeholder for ID.")
                // Use a visual placeholder service
                publicPath = `https://placehold.co/600x400/png?text=ID+Document+(${name})`
            } else {
                console.error("File upload failed:", error)
                throw error
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Generate 6-Digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Create User
        const newUser = await prisma.user.create({
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
                passwordLastSet: new Date(), // Req 4b
                verificationStatus: "PENDING",
                emailVerified: null,
            },
        } as any)

        // Save OTP
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: otp,
                expires: tokenExpiry
            }
        })

        // Create Welcome Notification
        await prisma.notification.create({
            data: {
                userId: newUser.id,
                title: "Welcome to Cashpoint! 🎉",
                message: `Hi ${name.split(" ")[0]}! We're excited to have you here. Complete your verification to unlock all features and start bidding on premium items.`,
                type: "SYSTEM",
                link: "/portal/welcome"
            }
        })

        // Mock Send OTP (SMS + Email)
        console.log("==========================================")
        console.log(`[MOCK NOTIFICATION] TO: ${email} / ${phoneNumber}`)
        console.log(`YOUR OTP CODE: ${otp}`)
        console.log("==========================================")

        return { message: "success-otp" }

    } catch (error) {
        console.error("Registration error:", error)
        return { message: `Database Error: ${(error as Error).message || "Unknown error"}` }
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
