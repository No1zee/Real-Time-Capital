"use client"

import { useState } from "react"
import { payRegistrationDeposit } from "@/app/actions/auctions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionMethod } from "@prisma/client"
import { Gavel, ShieldCheck, Banknote } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CheckoutDialog } from "@/components/payments/checkout-dialog"

export function AuctionRegistrationCard({ requiredDeposit }: { requiredDeposit: number }) {
    const [open, setOpen] = useState(false)

    async function handlePayment(method: TransactionMethod, reference: string) {
        // Wrapper to call the server action
        // In future: use initiateSystemPayment explicitly
        return await payRegistrationDeposit(requiredDeposit, method)
    }

    return (
        <Card className="max-w-md mx-auto border-2 border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Gavel className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Auction Registration</CardTitle>
                <CardDescription>
                    To participate in live auctions, a refundable security deposit is required.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Security Deposit</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {formatCurrency(requiredDeposit)}
                    </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Fully refundable if you don't win any items.</p>
                    <p>✓ Applied towards your purchase if you win.</p>
                    <p>✓ Secure payment processing.</p>
                </div>

                <div className="grid gap-3">
                    <CheckoutDialog
                        title="Pay Security Deposit"
                        description={`Secure your bidding spot with a ${formatCurrency(requiredDeposit)} deposit.`}
                        amount={requiredDeposit}
                        onConfirm={handlePayment}
                        open={open}
                        onOpenChange={setOpen}
                        trigger={
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Banknote className="mr-2 h-4 w-4" />
                                Pay Deposit Now
                            </Button>
                        }
                    />
                </div>
            </CardContent>
            <CardFooter className="justify-center text-xs text-muted-foreground">
                By processing, you agree to our Auction Terms & Conditions.
            </CardFooter>
        </Card>
    )
}
