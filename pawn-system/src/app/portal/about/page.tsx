
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">About Us</h2>
                <p className="text-slate-500 dark:text-slate-400">Learn more about PawnPortal.</p>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-amber-500" />
                        Our Mission
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-600 dark:text-slate-400">
                    <p>
                        At PawnPortal, we believe in providing a transparent, efficient, and secure platform for pawnbroking services.
                        Our mission is to modernize the industry by leveraging technology to offer fair valuations, quick loan processing,
                        and a seamless auction experience.
                    </p>
                    <p>
                        We are committed to building trust with our customers through integrity and exceptional service.
                        Whether you are looking to secure a short-term loan or find unique items in our auctions,
                        PawnPortal is your reliable partner.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
