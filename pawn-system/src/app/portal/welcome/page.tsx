import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Gavel, ArrowRight, ShieldCheck, UserCog } from "lucide-react"
import { auth } from "@/auth"

type Params = Promise<{ [key: string]: string | string[] | undefined }>

export default async function WelcomePage({ searchParams }: { searchParams: Params }) {
    const session = await auth()
    const user = session?.user
    const { next } = await searchParams
    const destination = (next as string) || "/portal/auctions"
    const isVerified = (user as any)?.verificationStatus === "VERIFIED"

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-700 p-4">
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
                    Your account is ready. What would you like to do next?
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Option 1: Continue to Auction (or Default) */}
                <Link href={destination} className="block group">
                    <div className="h-full p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm group-hover:shadow-md group-hover:border-amber-500/50 transition-all cursor-pointer text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                <Gavel className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-2xl mb-3">Start Bidding</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                {next ? "Return to the auction you were viewing and place your bid." : "Browse active auctions and find premium deals."}
                            </p>
                            <div className="mt-6 inline-flex items-center text-amber-600 dark:text-amber-500 font-bold">
                                Continue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Option 2: Verify Account OR Manage Account */}
                {isVerified ? (
                    <Link href="/portal/profile" className="block group">
                        <div className="h-full p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm group-hover:shadow-md group-hover:border-purple-500/50 transition-all cursor-pointer text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                                    <UserCog className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-2xl mb-3">Manage Account</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Update your preferences, view your history, and manage settings.
                                </p>
                                <div className="mt-6 inline-flex items-center text-slate-900 dark:text-white font-bold">
                                    Go to Profile <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link href="/portal/profile" className="block group">
                        <div className="h-full p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm group-hover:shadow-md group-hover:border-green-500/50 transition-all cursor-pointer text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-2xl mb-3">Verify Identity</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Complete your KYC verification now to unlock higher bidding limits.
                                </p>
                                <div className="mt-6 inline-flex items-center text-slate-900 dark:text-white font-bold">
                                    Verify Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    )
}
