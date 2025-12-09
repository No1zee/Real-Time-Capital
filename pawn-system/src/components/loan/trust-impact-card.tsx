import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, TrendingUp, TrendingDown, Info } from "lucide-react"

interface TrustImpactCardProps {
    status: string
    dueDate: Date
}

export function TrustImpactCard({ status, dueDate }: TrustImpactCardProps) {
    const isOverdue = new Date() > new Date(dueDate) && status === "ACTIVE"
    const isCompleted = status === "COMPLETED"

    return (
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-200/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-base font-semibold text-amber-600 dark:text-amber-400">Trust Score Impact</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* On Time Scenario */}
                    <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/10">
                        <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm text-green-700 dark:text-green-400">On-Time Repayment</p>
                            <p className="text-xs text-muted-foreground">+10 Points to your Trust Score</p>
                        </div>
                    </div>

                    {/* Late Scenario */}
                    <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/10 opacity-70 grayscale hover:grayscale-0 transition-all">
                        <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm text-red-700 dark:text-red-400">Late Repayment</p>
                            <p className="text-xs text-muted-foreground">-20 Points penalty</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500/80">
                        <Info className="w-3 h-3" />
                        <span>Higher score = Lower interest rates</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
