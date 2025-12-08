import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function EducationPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Financial Education Hub</h1>
                <p className="text-muted-foreground">Expert advice on leveraging your assets, valuing items, and managing liquidity.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        title: "How to Value Your Art",
                        desc: "Understanding the factors that drive art valuation in the current market.",
                        tag: "Valuation",
                        color: "bg-purple-500/10 text-purple-600"
                    },
                    {
                        title: "Leveraging IP for Liquidity",
                        desc: "Turn your royalties and copyrights into immediate capital without selling.",
                        tag: "Strategy",
                        color: "bg-blue-500/10 text-blue-600"
                    },
                    {
                        title: "Understanding Pawn Interest",
                        desc: "A transparent guide to how our interest rates are calculated.",
                        tag: "Finance",
                        color: "bg-green-500/10 text-green-600"
                    },
                    {
                        title: "Top 5 Assets for Quick Loans",
                        desc: "What items maintain the best value for collateral loans.",
                        tag: "Tips",
                        color: "bg-amber-500/10 text-amber-600"
                    }
                ].map((article, i) => (
                    <Card key={i} className="hover:shadow-lg transition-all cursor-pointer border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <Badge className={`w-fit mb-2 ${article.color} border-none`}>{article.tag}</Badge>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <CardDescription>{article.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4">Read Article &rarr;</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <h3 className="text-xl font-bold mb-4">Have a specific question?</h3>
                <p className="text-muted-foreground mb-6">Our financial experts are available for a detailed consultation regarding your high-value assets.</p>
                <Link href="/portal/contact" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">
                    Contact an Expert
                </Link>
            </div>
        </div>
    )
}
