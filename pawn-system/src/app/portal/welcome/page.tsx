import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Gavel, ArrowRight } from "lucide-react"
import { auth } from "@/auth"

export default async function WelcomePage() {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4 max-w-lg">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <Sparkles className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Welcome, {user?.name?.split(" ")[0] || "Trader"}!
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400">
                    Your account is ready. You&apos;re now part of <span className="font-semibold text-amber-600 dark:text-amber-500">Real Time Capital</span>.
                </p>
            </div>

            <div className="flex justify-center w-full">
                <Link href="/portal/auctions" className="block w-full max-w-md">
                    <div className="h-full p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6">
                            <Gavel className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-2xl mb-3">Start Bidding</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Enter the auction house and place your bids on premium items.
                        </p>
                        <div className="mt-6 inline-flex items-center text-amber-600 dark:text-amber-500 font-medium">
                            Enter Portal <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
