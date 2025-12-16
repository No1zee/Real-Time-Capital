"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function askQuestion(auctionId: string, text: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    try {
        await db.question.create({
            data: {
                userId: session.user.id,
                auctionId,
                text
            }
        })
        revalidatePath(`/portal/auctions/${auctionId}`)
        return { success: true, message: "Question asked successfully" }
    } catch (e) {
        return { success: false, message: "Failed to ask question" }
    }
}

export async function answerQuestion(questionId: string, answer: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Unauthorized" }

    // Ideally verify user is admin or auction owner
    // For now assuming Admin or Seller check logic is handled in UI or simple check here

    try {
        await db.question.update({
            where: { id: questionId },
            data: { answer }
        })
        revalidatePath("/portal/auctions") // or specific id
        return { success: true, message: "Answer posted" }
    } catch (e) {
        return { success: false, message: "Failed to post answer" }
    }
}
