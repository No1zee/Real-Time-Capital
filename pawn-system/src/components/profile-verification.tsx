"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadId } from "@/app/actions/verify"
import { useAI } from "./ai/ai-provider"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"

interface ProfileVerificationProps {
    user: any
}

export function ProfileVerification({ user }: ProfileVerificationProps) {
    const [isUploading, setIsUploading] = useState(false)
    const { notify } = useAI()

    const handleUpload = async (formData: FormData) => {
        setIsUploading(true)
        try {
            await uploadId(formData)
            notify("ID uploaded successfully. Verification pending.", undefined, undefined, "success")
        } catch (error) {
            notify("Failed to upload ID. Please try again.", undefined, undefined, "error")
        } finally {
            setIsUploading(false)
        }
    }

    const verificationUrl = typeof window !== "undefined" ? window.location.href : ""

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-medium mb-4">Identity Verification</h3>

                    {user.verificationStatus === "VERIFIED" ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Account Verified</span>
                        </div>
                    ) : user.verificationStatus === "PENDING" ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Verification Pending Review</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                You can upload a new ID if you made a mistake.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Unverified Account</span>
                        </div>
                    )}

                    <div className="mt-6">
                        <form action={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="idImage">Upload ID Document</Label>
                                <Input id="idImage" name="idImage" type="file" accept="image/*" required />
                                <p className="text-xs text-slate-500">
                                    Upload a clear photo of your National ID, Passport, or Driver's License.
                                </p>
                            </div>
                            <Button type="submit" disabled={isUploading} className="w-full">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Submit for Verification
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-medium mb-4">Mobile Verification</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Scan this QR code with your mobile device to easily upload your ID using your camera.
                </p>

                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    {verificationUrl && (
                        <QRCodeSVG value={verificationUrl} size={200} />
                    )}
                    <p className="mt-4 text-xs text-slate-400">Scan to open on mobile</p>
                </div>
            </div>
        </div>
    )
}
