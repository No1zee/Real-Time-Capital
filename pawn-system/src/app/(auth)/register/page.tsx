
"use client"

import { useActionState } from "react"
import { registerUser, RegisterState } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const initialState: RegisterState = {
    message: "",
    errors: {},
}

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerUser, initialState)
    const router = useRouter()

    useEffect(() => {
        if (state.message) {
            if (state.message.includes("success")) {
                toast.success(state.message)
                router.push("/login")
            } else if (state.message.includes("Error") || state.message.includes("Failed")) {
                toast.error(state.message)
            }
        }
    }, [state, router])

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground">Enter your information to get started</p>
            </div>
            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                    />
                    {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                    />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                        type="password"
                        name="password"
                        required
                    />
                    {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        required
                    />
                    {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="role">
                        Role (For Testing)
                    </label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="role"
                        name="role"
                    >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                </button>
            </form>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-primary">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
