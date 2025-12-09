import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { acceptLoanOffer } from "@/app/actions/loan"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CheckCircle, FileText, AlertCircle } from "lucide-react"

async function acceptOffer(formData: FormData) {
    "use server"
    const loanId = formData.get("loanId") as string
    await acceptLoanOffer(loanId)
    redirect("/portal/loans")
}

export default async function LoanOffersPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const pendingLoans = await prisma.loan.findMany({
        where: {
            userId: session.user.id,
            status: "PENDING"
        },
        include: { Item: true },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold">Your Loan Offers</h1>
                <p className="text-muted-foreground">Review and accept offers for your valued items.</p>
            </div>

            {pendingLoans.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Pending Offers</h3>
                    <p className="text-muted-foreground mt-2">
                        Submit more items for valuation to get new offers.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingLoans.map((loan) => (
                        <Card key={loan.id} className="border-amber-400 dark:border-amber-800 shadow-lg shadow-amber-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white text-xs font-bold rounded-bl-lg">
                                OFFER READY
                            </div>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                                    {formatCurrency(Number(loan.principalAmount))}
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {/* @ts-ignore */}
                                    {loan.items?.map((i: any) => i.name).join(", ") || "Unknown Items"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                                        <p className="font-semibold">{Number(loan.interestRate)}%</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                        <p className="text-xs text-muted-foreground">Duration</p>
                                        <p className="font-semibold">{loan.durationDays} Days</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded col-span-2">
                                        <p className="text-xs text-muted-foreground">Total Repayment</p>
                                        <p className="font-semibold text-green-600">
                                            {formatCurrency(Number(loan.principalAmount) * (1 + Number(loan.interestRate) / 100))}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-2 rounded border border-amber-100 dark:border-amber-900/20">
                                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p>By accepting, you agree to the pawn ticket terms. The loan amount will be credited to your wallet immediately.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <form action={acceptOffer} className="w-full">
                                    <input type="hidden" name="loanId" value={loan.id} />
                                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-md">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Sign & Accept Offer
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
