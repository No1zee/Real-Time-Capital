"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle, Clock, XCircle } from "lucide-react"
import { submitKYC } from "@/app/actions/kyc"
import { toast } from "sonner"

interface KYCUploadFormProps {
    status: string // "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED"
    note?: string | null
}

export function KYCUploadForm({ status, note }: KYCUploadFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            await submitKYC(formData)
            toast.success("Documents submitted successfully")
        } catch (error) {
            toast.error("Failed to submit documents")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (status === "VERIFIED") {
        return (
            <Card className="bg-green-500/10 border-green-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <CardTitle className="text-green-700">Identity Verified</CardTitle>
                    </div>
                    <CardDescription>Your account is fully verified. You can now participate in all auctions.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (status === "PENDING") {
        return (
            <Card className="bg-blue-500/10 border-blue-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <CardTitle className="text-blue-700">Verification Pending</CardTitle>
                    </div>
                    <CardDescription>We are reviewing your documents. This usually takes 24-48 hours.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>
                    To ensure the safety of our marketplace, we require all users to verify their identity.
                    Please upload a clear photo of your National ID or Passport.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {status === "REJECTED" && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-red-700">Verification Rejected</h4>
                            <p className="text-sm text-red-600 mt-1">{note || "Please upload a clearer image."}</p>
                        </div>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            name="idDocument"
                            accept="image/*"
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Upload className="w-8 h-8" />
                            <span className="font-medium">Click to upload ID Document</span>
                            <span className="text-xs">JPG, PNG up to 5MB</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
