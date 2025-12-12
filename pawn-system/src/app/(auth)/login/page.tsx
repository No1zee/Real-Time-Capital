
"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"

import { useSearchParams } from "next/navigation"

import { Suspense } from "react"

function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/portal"

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="font-bold text-slate-900 text-2xl">R</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-black">Welcome</h1>
                <p className="text-slate-400">Enter your credentials to access your account</p>
            </div>
            <form action={dispatch} className="space-y-4">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-slate-200" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none text-slate-200" htmlFor="password">
                            Password
                        </label>
                        <Link href="#" className="text-sm text-amber-500 hover:text-amber-400 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50 relative z-10"
                        id="password"
                        type="password"
                        name="password"
                        required
                    />
                </div>

                {errorMessage && (
                    <div className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-md border border-red-500/20">
                        {errorMessage}
                    </div>
                )}

                <button
                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-amber-500 text-slate-900 hover:bg-amber-400 h-11 px-4 py-2 w-full shadow-lg shadow-amber-500/20"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                </button>
            </form>
            <div className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="font-medium text-amber-500 hover:text-amber-400 hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
