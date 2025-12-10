"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOtp } from "@/app/actions/verify-otp"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Mail } from "lucide-react"
import { toast } from "sonner"

export default function VerifyOtpPage() {
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="bg-amber-500/10 p-4 rounded-full">
                        <ShieldCheck className="h-12 w-12 text-amber-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">Verify Your Account</h1>
                <p className="text-slate-400 text-center mb-6">
                    We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
                    <br />Checks your "Messages" (Mock Console)
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Enter OTP Code</label>
                        <input
                            className="flex h-12 w-full text-center text-2xl tracking-widest rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:border-amber-500 transition-colors"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-bold bg-amber-500 text-slate-900 hover:bg-amber-400"
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify Code"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
