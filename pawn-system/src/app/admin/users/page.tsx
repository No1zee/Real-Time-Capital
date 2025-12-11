import { getAllUsers, updateUserRole, toggleUserStatus } from "@/app/actions/admin/users"
import { Badge } from "@/components/ui/badge"
import { TierBadge } from "@/components/tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Search, Shield, Ban, CheckCircle } from "lucide-react"
import Link from "next/link"
import { MobileAdminHeader } from "@/components/admin/mobile-header"

export default async function AdminUsersPage() {
    const users = await getAllUsers()

    return (
        <div className="p-8 space-y-8">
            <MobileAdminHeader title="User Management" backHref="/admin/dashboard" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage users, roles, and account status.</p>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="search"
                                placeholder="Search users..."
                                className="pl-9 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Link href={`/admin/users/${user.id}`} className="hover:opacity-80 transition-opacity block">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white underline decoration-slate-300 underline-offset-4">{user.name}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "STAFF" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                            <TierBadge tier={user.tier} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "outline" : "destructive"} className={user.isActive ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                            {user.isActive ? "Active" : "Suspended"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.verificationStatus === "VERIFIED" ? "text-green-600 border-green-200 bg-green-50" :
                                                user.verificationStatus === "PENDING" ? "text-amber-600 border-amber-200 bg-amber-50" :
                                                    "text-slate-500"
                                        }>
                                            {user.verificationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(Number(user.walletBalance))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.role !== "ADMIN" && (
                                                <form action={async () => {
                                                    "use server"
                                                    await updateUserRole(user.id, user.role === "STAFF" ? "CUSTOMER" : "STAFF")
                                                }}>
                                                    <Button variant="ghost" size="icon" title={user.role === "STAFF" ? "Demote to Customer" : "Promote to Staff"}>
                                                        <Shield className={`h-4 w-4 ${user.role === "STAFF" ? "text-amber-600" : "text-slate-400"}`} />
                                                    </Button>
                                                </form>
                                            )}

                                            <form action={async () => {
                                                "use server"
                                                await toggleUserStatus(user.id)
                                            }}>
                                                <Button variant="ghost" size="icon" title={user.isActive ? "Suspend User" : "Activate User"}>
                                                    {user.isActive ? (
                                                        <Ban className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </Button>
                                            </form>
                                        </div>
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
