import { PaymentInitiateRequest, PaymentInitiateResponse, PaymentProvider, PaymentStatusCheckResponse } from "../types"

export class MockPaymentProvider implements PaymentProvider {
    name = "MockProvider"

    async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulate random failure (Optionally toggleable)
        const isSuccess = true

        if (!isSuccess) {
            return {
                success: false,
                transactionId: "",
                status: "FAILED"
            }
        }

        const mockId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        return {
            success: true,
            transactionId: mockId,
            status: "COMPLETED", // Instant success for mock
            instructions: "Payment processed successfully via Mock Gateway."
        }
    }

    async checkStatus(transactionId: string): Promise<PaymentStatusCheckResponse> {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
            transactionId,
            status: "COMPLETED"
        }
    }
}
