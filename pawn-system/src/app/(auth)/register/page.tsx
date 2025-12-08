
"use client"

import { useActionState } from "react"
import { registerUser, RegisterState } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useSearchParams } from "next/navigation"

const initialState: RegisterState = {
    message: "",
    errors: {},
}

import { Suspense } from "react"

function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerUser, initialState)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl")

    useEffect(() => {
        if (state.message) {
            if (state.message.includes("success")) {
                toast.success(state.message)
                router.push(callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login")
            } else if (state.message.includes("Error") || state.message.includes("Failed")) {
                toast.error(state.message)
            }
        }
    }, [state, router, callbackUrl])

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="font-bold text-slate-900 text-2xl">R</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
                <p className="text-slate-400">Enter your information to get started</p>
            </div>
            <form action={formAction} className="space-y-4">
                <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                    />
                    {state.errors?.name && <p className="text-sm text-red-400">{state.errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                    />
                    {state.errors?.email && <p className="text-sm text-red-400">{state.errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                        type="password"
                        name="password"
                        required
                    />
                    {state.errors?.password && <p className="text-sm text-red-400">{state.errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        required
                    />
                    {state.errors?.confirmPassword && <p className="text-sm text-red-400">{state.errors.confirmPassword}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="role">
                        Role (For Testing)
                    </label>
                    <select
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-slate-900"
                        id="role"
                        name="role"
                    >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <button
                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-500 text-slate-900 hover:bg-amber-400 h-11 px-4 py-2 w-full shadow-lg shadow-amber-500/20"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
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
