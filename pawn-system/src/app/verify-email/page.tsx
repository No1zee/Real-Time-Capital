
import { verifyEmail } from "@/app/actions/verify"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { token?: string }
}) {
    const token = searchParams.token

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
                <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center max-w-md w-full">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Missing Token</h1>
                    <p className="text-slate-400 mb-6">This verification link is invalid.</p>
                    <Link href="/login">
                        <Button className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600">Back to Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const result = await verifyEmail(token)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className={`p-8 rounded-xl border text-center max-w-md w-full ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                {result.success ? (
                    <>
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
                        <p className="text-slate-300 mb-6">{result.success}</p>
                        <Link href="/login">
                            <Button className="w-full bg-green-500 text-white hover:bg-green-600">Sign In Now</Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
                        <p className="text-slate-300 mb-6">{result.error}</p>
                        <Link href="/register">
                            <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white">Register Again</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
