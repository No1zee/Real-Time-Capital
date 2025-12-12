"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOtp } from "@/app/actions/verify-otp"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Mail } from "lucide-react"
import { toast } from "sonner"

function VerifyOtpContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [otp, setOtp] = useState("")
    const [isPending, setIsPending] = useState(false)

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        if (!email) {
            toast.error("Email missing. Please register again.")
            return
        }
        setIsPending(true)
        const result = await verifyOtp(email, otp)
        setIsPending(false)

        if (result.success) {
            toast.success("Account Verified Successfully!")
            router.push("/login?verified=true")
        } else {
            toast.error(result.error)
        }
    }

    if (!email) {
        return <div className="p-8 text-center text-white">Invalid Request. Email missing.</div>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground text-center mb-2">Verify Your Account</h1>
                <p className="text-muted-foreground text-center mb-6">
                    We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
                    <br />Checks your "Messages" (Mock Console)
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Enter OTP Code</label>
                        <input
                            className="flex h-12 w-full text-center text-2xl tracking-widest rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary transition-colors"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify Code"}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <VerifyOtpContent />
        </Suspense>
    )
}
