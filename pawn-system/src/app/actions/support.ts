"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { TicketCategory, TicketPriority, SenderType, TicketStatus } from "@prisma/client"
import { z } from "zod"
import { logActivity } from "@/app/actions/admin/analytics"

const ticketSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    category: z.nativeEnum(TicketCategory),
    description: z.string().min(1, "Description is required"),
    priority: z.nativeEnum(TicketPriority).optional(),
})

export type TicketState = {
    errors?: {
        subject?: string[]
        category?: string[]
        description?: string[]
        priority?: string[]
    }
    message?: string | null
    success?: boolean
}

export async function createTicket(prevState: TicketState, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: "Unauthorized" }
    }

    const validatedFields = ticketSchema.safeParse({
        subject: formData.get("subject"),
        category: formData.get("category"),
        description: formData.get("description"),
        priority: formData.get("priority") || TicketPriority.MEDIUM,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    const { subject, category, description, priority } = validatedFields.data

    try {
        const ticket = await db.ticket.create({
            data: {
                userId: session.user.id,
                subject,
                category,
                description,
                priority: priority || "MEDIUM",
                status: "OPEN",
                Messages: {
                    create: {
                        sender: "USER",
                        message: description // Initial message is the description
                    }
                }
            }
        })

        await logActivity("CREATE_TICKET", { ticketId: ticket.id, userId: session.user.id })

        revalidatePath("/portal/support")
        return { success: true, message: "Ticket Created Successfully!" }
    } catch (error) {
        console.error("Failed to create ticket:", error)
        return { message: "Failed to create ticket. Please try again." }
    }
}

export async function sendMessage(ticketId: string, message: string) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }

    try {
        const userRole = session.user.role
        const sender: SenderType = (userRole === "ADMIN" || userRole === "STAFF") ? "SUPPORT" : "USER"

        await db.ticketMessage.create({
            data: {
                ticketId,
                message,
                sender
            }
        })

        // Simplify status update logic: if User replies to Resolved, it reopens? Optional.
        // For now, just add message.

        await db.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        })

        revalidatePath(`/portal/support/${ticketId}`)
        revalidatePath(`/admin/support/${ticketId}`)
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to send message" }
    }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await db.ticket.update({
            where: { id: ticketId },
            data: { status }
        })

        revalidatePath("/admin/support")
        revalidatePath(`/portal/support/${ticketId}`)
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to update status" }
    }
}
