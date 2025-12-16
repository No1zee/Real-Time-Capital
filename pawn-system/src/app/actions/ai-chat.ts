"use server"

import { auth } from "@/auth"
import { model } from "@/lib/ai/gemini"

export async function askAI(message: string, context?: { path?: string }) {
    const session = await auth()

    // Simulate network delay for "thinking" feel (only if mock)
    // Real API has its own latency

    try {
        if (model) {
            const systemContext = `
                You are a helpful AI assistant for specific use in a Pawn Shop & Auction application called "Real Time Capital".
                User Name: ${session?.user?.name || "Guest"}
                Role: ${session?.user?.role || "Visitor"}
                Current Page: ${context?.path || "Unknown"}
                
                Capabilities:
                - Explain loan terms (50% LTV, 15% interest).
                - Explain auction process (deposit required, 24h payment window).
                - Assist with navigation based on the "Current Page".
                
                Keep responses concise (under 3 sentences) and friendly.
                If asked about sensitive data (passwords, other users), refuse politely.
            `

            const result = await model.generateContent([
                systemContext,
                `User Question: ${message}`
            ])
            const response = result.response
            const text = response.text()

            return { message: text }
        }
    } catch (error) {
        console.error("Gemini API Error:", error)
        // Fallthrough to mock
    }

    // --- FALLBACK MOCK LOGIC ---
    await new Promise(r => setTimeout(r, 1000))

    const lower = message.toLowerCase()

    // Context-Aware Mock Responses
    if (context?.path?.includes("/auctions") && (lower.includes("how") || lower.includes("help"))) {
        return { message: "You are constantly on the Auctions page. Place a bid by clicking an item, or use the 'Buy Now' option if available." }
    }

    if (context?.path?.includes("/loans") && (lower.includes("how") || lower.includes("help"))) {
        return { message: "To request a loan, click 'New Application', upload your item photos, and wait for our instant valuation." }
    }

    // 1. Contextual Intent Recognition (Mocking NLU)
    if (lower.includes('loan') || lower.includes('pawn') || lower.includes('borrow')) {
        return {
            message: "To get a loan, navigate to 'Pawn Assets'. Upload photos of your item, and our system will provide an instant valuation offer."
        }
    }

    if (lower.includes('value') || lower.includes('worth') || lower.includes('price')) {
        return {
            message: "Our AI Valuation Engine crawls marketplaces like eBay and Amazon to estimate fair market value based on your item's condition and specs."
        }
    }

    if (lower.includes('auction') || lower.includes('bid')) {
        return {
            message: "Auctions run in real-time. You'll need a refundable security deposit to start bidding. Winners have 24 hours to complete payment."
        }
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
        return {
            message: `Hello ${session?.user?.name || 'there'}! I'm your smart assistant. You can ask me about loans, valuations, active auctions, or your account status.`
        }
    }

    // Default Fallback
    return {
        message: "I'm processing that... As I'm currently in 'Training Mode' (API Key missing), I'm best at answering questions about Loans, Valuations, and Auctions. What would you like to know?"
    }
}
