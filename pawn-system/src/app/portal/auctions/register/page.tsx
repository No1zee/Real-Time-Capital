import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { checkBiddingEligibility } from "@/app/actions/auctions"
import { AuctionRegistrationCard } from "@/components/auctions/registration-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AuctionRegisterPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const eligibility = await checkBiddingEligibility()

    if (eligibility.eligible) {
        redirect("/portal/auctions")
    }

    return (
        <div className="container mx-auto max-w-md py-10 space-y-6">
            <Link href="/portal/auctions" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Auctions
            </Link>

            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold">Registration</h1>
                <p className="text-muted-foreground">Pay your security deposit to start bidding.</p>
            </div>

            <AuctionRegistrationCard requiredDeposit={eligibility.requiredDeposit || 50} />
        </div>
    )
}
