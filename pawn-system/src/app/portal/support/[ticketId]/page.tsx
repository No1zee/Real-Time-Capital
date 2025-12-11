import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChatInterface } from "./chat-interface"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { Messages: { orderBy: { timestamp: 'asc' } } }
    })

    if (!ticket) notFound()

    // Authorization
    if (ticket.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
        redirect("/portal/support")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <a href="/portal/support" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-6 w-6" />
                </a>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                            {ticket.status}
                        </Badge>
                        <Badge variant="outline">{ticket.category.replace("_", " ")}</Badge>
                        <span className="text-sm text-muted-foreground">
                            #{ticket.id.slice(-6)}
                        </span>
                    </div>
                </div>
            </div>

            <ChatInterface
                ticketId={ticket.id}
                messages={ticket.Messages}
                userId={session.user.id}
            />
        </div>
    )
}
