import { auth } from "@/auth"
import { KYCUploadForm } from "@/components/kyc-upload-form"
import { TierBadge } from "@/components/tier-badge"
import { redirect } from "next/navigation"
import { getUserBids } from "@/app/actions/user"
import { BiddingHistory } from "@/components/bidding-history"
import { KnowledgeWidget } from "@/components/content/knowledge-widget"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const bids = await getUserBids()

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Manage your account settings and verification status.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold text-3xl">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span>{session.user.name?.[0] || "U"}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{session.user.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{session.user.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {session.user.role}
                    </div>
                    <TierBadge tier={(session.user as any).tier} className="ml-2" />
                </div>
            </div>

            <KYCUploadForm
                status={(session.user as any).verificationStatus || "UNVERIFIED"}
                note={(session.user as any).verificationNote}
            />

            {session.user.role !== "ADMIN" && session.user.role !== "STAFF" && (
                <BiddingHistory bids={bids} currentUserId={session.user.id} />
            )}
            <div className="mt-8">
                <KnowledgeWidget category="security" title="Account Security" limit={3} />
            </div>
        </div>
    )
}
