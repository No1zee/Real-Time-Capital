import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function AdminSupportPage() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        redirect("/login")
    }

    const tickets = await prisma.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            User: { select: { name: true, email: true } },
            Messages: { orderBy: { timestamp: 'desc' }, take: 1 }
        }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
                <p className="text-muted-foreground">Manage customer inquiries and issues.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tickets</CardTitle>
                    <CardDescription>
                        {tickets.length} total tickets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Last Update</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">
                                        {ticket.subject}
                                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                            {ticket.Messages[0]?.message || ticket.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{ticket.User.name}</span>
                                            <span className="text-xs text-muted-foreground">{ticket.User.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            ticket.status === 'OPEN' ? 'default' :
                                                ticket.status === 'RESOLVED' ? 'success' :
                                                    ticket.status === 'IN_PROGRESS' ? 'warning' : 'secondary'
                                        }>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{ticket.priority}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/support/${ticket.id}`} className="text-primary hover:underline">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
