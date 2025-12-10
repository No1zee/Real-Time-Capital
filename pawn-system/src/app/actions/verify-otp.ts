"use server"

import { prisma } from "@/lib/prisma"

export async function verifyOtp(email: string, otp: string) {
    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: otp
            },
        })

        if (!verificationToken) {
            return { error: "Invalid OTP Code" }
        }

        const hasExpired = new Date() > verificationToken.expires
        if (hasExpired) {
            await prisma.verificationToken.delete({ where: { token: otp } })
            return { error: "OTP Code expired" }
        }

        // Verify User
        await prisma.user.update({
            where: { email }, // Use email as unique identifier
            data: {
                emailVerified: new Date(),
                verificationStatus: "VERIFIED",
            },
        })

        // Delete Token
        await prisma.verificationToken.delete({ where: { token: otp } })

        return { success: true }

    } catch (error) {
        console.error("Verification error:", error)
        return { error: "Failed to verify OTP" }
    }
}
