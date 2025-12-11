import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChatInterface } from "@/components/support/chat-interface"
import { TicketStatusControl } from "@/components/support/ticket-status-control"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, User as UserIcon } from "lucide-react"

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            User: { select: { name: true, email: true, phoneNumber: true } },
            Messages: { orderBy: { timestamp: 'asc' } }
        }
    })

    if (!ticket) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/support" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ticket #{ticket.id.slice(-6)}</h1>
                        <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <TicketStatusControl ticketId={ticket.id} currentStatus={ticket.status} />
                    <Badge variant={ticket.priority === 'HIGH' ? 'destructive' : 'outline'}>
                        {ticket.priority}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conversation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChatInterface
                                ticketId={ticket.id}
                                messages={ticket.Messages}
                                currentUserType="SUPPORT"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{ticket.User.name || "Unknown"}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.User.email}</p>
                                </div>
                            </div>
                            <div className="text-sm space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span>{ticket.User.phoneNumber || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">{ticket.category.replace("_", " ")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
