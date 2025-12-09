
"use client"

import { useActionState } from "react"
import { registerUser, RegisterState } from "@/app/actions/auth"
import { Loader2, Upload, Calendar, MapPin, Phone, User, Home, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Fixed import
import { Suspense } from "react"

const initialState: RegisterState = {
    message: "",
    errors: {},
}

function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerUser, initialState)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/login"

    // File Name State
    const [fileName, setFileName] = useState<string | null>(null)

    useEffect(() => {
        if (state.message) {
            if (state.message.includes("success")) {
                toast.success(state.message, { duration: 5000 })
                // Redirect to login after slight delay to see toast, or just push
                setTimeout(() => router.push(`/login`), 2000)
            } else if (state.message.includes("Error") || state.message.includes("Failed") || state.message.includes("use")) {
                toast.error(state.message)
            }
        }
    }, [state, router])

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="font-bold text-slate-900 text-2xl">R</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Join Real Time Capital</h1>
                <p className="text-slate-400">Complete your profile to start borrowing and bidding.</p>
            </div>

            <form action={formAction} className="space-y-6">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />

                {/* Section 1: Personal Info */}
                <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-amber-500 mb-2 flex items-center gap-2">
                        <User className="h-5 w-5" /> Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="name">Full Name</label>
                            <input
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                id="name" name="name" placeholder="John Doe" required
                            />
                            {state.errors?.name && <p className="text-xs text-red-400">{state.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="dateOfBirth">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-amber-500/50"
                                    id="dateOfBirth" name="dateOfBirth" type="date" required
                                />
                            </div>
                            {state.errors?.dateOfBirth && <p className="text-xs text-red-400">{state.errors.dateOfBirth}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="nationalId">National ID Number</label>
                            <input
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                id="nationalId" name="nationalId" placeholder="63-1234567-T-07" required
                            />
                            {state.errors?.nationalId && <p className="text-xs text-red-400">{state.errors.nationalId}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="idImage">Upload ID (Image/PDF)</label>
                            <div className="relative">
                                <input
                                    type="file" id="idImage" name="idImage" accept="image/*,application/pdf" className="hidden"
                                    onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                                    required
                                />
                                <label htmlFor="idImage" className="flex h-11 w-full items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm cursor-pointer hover:bg-slate-900 transition-colors">
                                    <span className="text-slate-400 truncate">{fileName || "Click to upload ID"}</span>
                                    <Upload className="h-4 w-4 text-amber-500" />
                                </label>
                            </div>
                            {state.errors?.idImage && <p className="text-xs text-red-400">{state.errors.idImage}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Info */}
                <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-amber-500 mb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="email">Email Address</label>
                            <input
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                id="email" type="email" name="email" placeholder="john@example.com" required
                            />
                            {state.errors?.email && <p className="text-xs text-red-400">{state.errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="phoneNumber">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                    id="phoneNumber" name="phoneNumber" type="tel" placeholder="+263 77 123 4567" required
                                />
                            </div>
                            {state.errors?.phoneNumber && <p className="text-xs text-red-400">{state.errors.phoneNumber}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200" htmlFor="address">Residential Address</label>
                                <input
                                    className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                    id="address" name="address" placeholder="123 Samora Machel Ave" required
                                />
                                {state.errors?.address && <p className="text-xs text-red-400">{state.errors.address}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200" htmlFor="location">City / Location</label>
                                <input
                                    className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                    id="location" name="location" placeholder="Harare" required
                                />
                                {state.errors?.location && <p className="text-xs text-red-400">{state.errors.location}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Security */}
                <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-amber-500 mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" /> Account Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="password">Password</label>
                            <input
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                id="password" type="password" name="password" required
                                title="Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special"
                            />
                            {state.errors?.password && <p className="text-xs text-red-400">{state.errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                className="flex h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-amber-500/50"
                                id="confirmPassword" type="password" name="confirmPassword" required
                            />
                            {state.errors?.confirmPassword && <p className="text-xs text-red-400">{state.errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" name="terms" className="mt-1" required />
                    <label htmlFor="terms" className="text-sm text-slate-400 leading-snug">
                        I agree to the <Link href="/terms" className="text-amber-500 hover:underline">Terms & Conditions</Link> and Confirm the accuracy of the provided information.
                    </label>
                </div>
                {state.errors?.terms && <p className="text-xs text-red-400">{state.errors.terms}</p>}

                {/* Role (Hidden/Optional for now, defaulted to CUSTOMER in schema) */}
                {/* Only allow Staff if specifically requested or dev mode. For strict KYC form, usually it's Customer only. */}
                {/* We'll hide role selector or keep it simpler? User asked for "Customer Registration". */}
                {/* I will add a hidden input or just rely on default. */}
                {/* But for testing, maybe we want to create staff? */}
                {/* I'll leave it out. Admins promote staff. */}

                <button
                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-500 text-slate-900 hover:bg-amber-400 h-12 px-4 py-2 w-full shadow-lg shadow-amber-500/20 mt-4"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Create Verified Account
                </button>
            </form>
            <div className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="font-medium text-amber-500 hover:text-amber-400 hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
            <RegisterForm />
        </Suspense>
    )
}
