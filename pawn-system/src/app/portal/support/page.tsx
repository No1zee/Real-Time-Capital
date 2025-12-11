import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { MessageSquare, ExternalLink } from "lucide-react"

export default async function SupportPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const tickets = await prisma.ticket.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: { Messages: { orderBy: { timestamp: 'desc' }, take: 1 } }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Support</h1>
                    <p className="text-muted-foreground">
                        Need help? Track your existing tickets or create a new one.
                    </p>
                </div>
                <CreateTicketDialog />
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                            <p>No support tickets yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <CardContent className="p-0">
                                <Link href={`/portal/support/${ticket.id}`} className="block p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">{ticket.subject}</span>
                                                <Badge variant={
                                                    ticket.status === 'OPEN' ? 'default' :
                                                        ticket.status === 'RESOLVED' ? 'success' : 'secondary'
                                                }>
                                                    {ticket.status}
                                                </Badge>
                                                <Badge variant="outline">{ticket.category.replace("_", " ")}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {ticket.Messages[0]?.message || ticket.description}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <p>{formatDate(ticket.updatedAt)}</p>
                                            <p className="mt-1">#{ticket.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
