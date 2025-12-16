"use server"

import { auth } from "@/auth"
import { model } from "@/lib/ai/gemini"

interface ValuationParams {
    category: string
    name: string
    description: string
    condition: string
}

export async function generateSmartValuation(params: ValuationParams) {
    const session = await auth()

    // 1. Mock fallback if no API key
    if (!model) {
        await new Promise(r => setTimeout(r, 1500)) // Thinking time
        return {
            estimatedValue: 650,
            currency: "USD",
            confidence: 0.85,
            reasoning: "Based on historical sales data for similar items in 'Good' condition. Market trends indicate stable demand."
        }
    }

    // 2. Real Gemini Valuation
    try {
        const prompt = `
            Act as an expert professional appraiser for a pawn shop.
            Evaluate the following item:
            - Category: ${params.category}
            - Name: ${params.name}
            - Description: ${params.description}
            - Condition: ${params.condition}

            Provide a JSON response ONLY with the following structure:
            {
                "estimatedValue": number (conservative estimate in USD),
                "confidence": number (0.0 to 1.0),
                "reasoning": "short explanation (max 2 sentences)"
            }
        `

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)

    } catch (error) {
        console.error("AI Valuation Error:", error)
        return {
            estimatedValue: 0,
            currency: "USD",
            confidence: 0,
            reasoning: "AI Appraisal unavailable. Please consult a human expert."
        }
    }
}
