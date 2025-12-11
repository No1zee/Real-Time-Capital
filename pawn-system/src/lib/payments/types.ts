import { TransactionMethod } from "@prisma/client"

export interface PaymentInitiateRequest {
    amount: number
    currency: string
    email: string
    reference: string // Internal Reference (e.g., LOAN-123)
    method: TransactionMethod
    description?: string
    metadata?: Record<string, any>
}

export interface PaymentInitiateResponse {
    success: boolean
    transactionId: string // Provider's ID (or internal if mock)
    redirectUrl?: string // For hosted pages like Paynow
    instructions?: string // For manual methods like Ecocash USSD
    status: PaymentStatus
}

export interface PaymentStatusCheckResponse {
    transactionId: string
    status: PaymentStatus
    providerReference?: string
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"

export interface PaymentProvider {
    name: string
    initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>
    checkStatus(transactionId: string): Promise<PaymentStatusCheckResponse>
}
