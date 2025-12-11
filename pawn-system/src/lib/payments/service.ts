import { db } from "@/lib/db"
import { MockPaymentProvider } from "./providers/mock"
import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentProvider } from "./types"
import { TransactionType } from "@prisma/client"

// Factory to get provider
function getProvider(method: string): PaymentProvider {
    // In future: if (method === "PAYNOW") return new PaynowProvider()
    return new MockPaymentProvider()
}

// Central Service
export async function initiateSystemPayment(
    userId: string,
    request: PaymentInitiateRequest,
    type: TransactionType
): Promise<PaymentInitiateResponse> {

    const provider = getProvider(request.method)

    // 1. Log Attempt (NFR Req 5: Reliability - Flagging transactions)
    // We create a PENDING transaction record immediately.
    const transaction = await db.transaction.create({
        data: {
            userId,
            amount: request.amount,
            type: type,
            status: "PENDING",
            method: request.method,
            reference: request.reference,
            reference: request.reference
        }
    })

    try {
        // 2. Initiate with Provider
        const response = await provider.initiatePayment(request)

        // 3. Update Transaction Record based on Provider Response
        await db.transaction.update({
            where: { id: transaction.id },
            data: {
                status: response.status as any,
                // store provider ref if needed? We use 'reference' for internal, maybe add 'providerId'?
                // For now, relies on description or separate log if needed.
            }
        })

        if (!response.success) {
            // Explicitly flag failure if provider says so
            await db.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            })
        }

        return response

    } catch (error) {
        // 4. Catch Unexpected Failures (NFR Req 5)
        console.error("Payment System Error:", error)
        await db.transaction.update({
            where: { id: transaction.id },
            data: {
                status: "FAILED",
                status: "FAILED"
            }
        })

        return {
            success: false,
            transactionId: "",
            status: "FAILED",
            instructions: "Internal System Error during payment initiation."
        }
    }
}
