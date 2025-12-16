import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function AdminPaymentsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5 text-amber-500" />
                        Payment Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Payment processing and history for administrators will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
