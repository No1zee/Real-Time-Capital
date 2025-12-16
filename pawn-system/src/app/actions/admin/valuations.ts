"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getAllValuationsAdmin() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Unauthorized")
    }

    // Fetch items that are relevant to the valuation workflow
    // This includes items pending valuation, in market eval, or having a final valuation
    return await prisma.item.findMany({
        where: {
            OR: [
                { status: "PENDING_VALUATION" },
                { status: "VALUED" }, // Completed valuations
                { valuationStatus: { not: "PENDING" } } // Any item that has started the workflow
            ]
        },
        include: {
            User: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })
}
