import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Banknote, Gavel, Package, Users, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PERMISSIONS } from "@/lib/permissions"

export default async function DashboardPage() {
    const session = await auth()
    const user = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        select: { role: true, permissions: true }
    })

    if (!user) return null

    // Helper to check permission
    const hasPermission = (permission: string) => {
        return user.role === "ADMIN" || user.permissions.includes(permission)
    }

    const canViewSensitives = user.role === "ADMIN"

    // Mock Data - In real app, fetch based on permissions
    const stats = [
        {
            name: "Total Active Loans",
            value: canViewSensitives ? "$45,231.89" : "$****",
            icon: Banknote,
            change: "+20.1%",
            trend: "up",
            permission: PERMISSIONS.LOANS_READ
        },
        {
            name: "Items in Inventory",
            value: "356",
            icon: Package,
            change: "+180",
            trend: "up",
            permission: "INVENTORY_READ" // Assuming we might add this later, or reuse another
        },
        {
            name: "Active Auctions",
            value: "12",
            icon: Gavel,
            change: "-2",
            trend: "down",
            permission: PERMISSIONS.AUCTIONS_READ
        },
        {
            name: "Total Customers",
            value: "2,300",
            icon: Users,
            change: "+45",
            trend: "up",
            permission: PERMISSIONS.CUSTOMERS_READ
        },
    ]

    return (
        <div className="space-y-4 md:space-y-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                    {user.role === "ADMIN" ? "Admin Overview" : "Staff Workspace"}
                </p>
            </div>

            {user.role !== "ADMIN" && user.permissions.length === 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-6 text-amber-800">
                        <ShieldAlert className="h-5 w-5 md:h-8 md:w-8" />
                        <div>
                            <h3 className="text-sm md:text-base font-semibold">Limited Access</h3>
                            <p className="text-xs md:text-sm">You have not been assigned any specific permissions. Please contact an administrator.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-3 grid-cols-2 md:gap-4 lg:grid-cols-4">
                {stats.map((stat) => {
                    if (stat.permission && !hasPermission(stat.permission) && stat.permission !== "INVENTORY_READ") return null
                    // Fallback for inventory since we didn't strictly define it yet, or hide it
                    if (stat.permission === "INVENTORY_READ" && !hasPermission(PERMISSIONS.LOANS_READ)) return null

                    return (
                        <div key={stat.name} className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 md:p-6">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                                <h3 className="tracking-tight text-[10px] md:text-sm font-medium text-muted-foreground truncate pr-1">{stat.name}</h3>
                                <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                            <div className="content-center">
                                <div className="text-lg md:text-2xl font-bold truncate">{stat.value}</div>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                                    <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                                        {stat.change}
                                    </span>{" "}
                                    <span className="hidden md:inline">from last month</span>
                                    <span className="md:hidden">mo.</span>
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
                {hasPermission(PERMISSIONS.LOANS_READ) && (
                    <div className="lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-3 md:p-6 flex flex-col space-y-1">
                            <h3 className="text-sm md:text-lg font-semibold leading-none tracking-tight">Recent Loans</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">Latest transactions processed today.</p>
                        </div>
                        <div className="p-3 md:p-6 pt-0">
                            <div className="space-y-3 md:space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Banknote className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                                        </div>
                                        <div className="ml-2 md:ml-4 space-y-0.5 md:space-y-1 min-w-0 flex-1">
                                            <p className="text-xs md:text-sm font-medium leading-none truncate">Loan #{1000 + i}</p>
                                            <p className="text-[10px] md:text-sm text-muted-foreground truncate">Customer Name</p>
                                        </div>
                                        <div className="ml-auto text-xs md:text-base font-medium">+$250.00</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {hasPermission(PERMISSIONS.VALUATIONS_READ) && (
                    <div className="lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-3 md:p-6 flex flex-col space-y-1">
                            <h3 className="text-sm md:text-lg font-semibold leading-none tracking-tight">Pending Approvals</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">Loans requiring manager review.</p>
                        </div>
                        <div className="p-3 md:p-6 pt-0">
                            <div className="space-y-3 md:space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 md:pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-0.5 md:space-y-1">
                                            <p className="text-xs md:text-sm font-medium truncate max-w-[120px]">Gold Necklace 18k</p>
                                            <p className="text-[10px] md:text-xs text-muted-foreground">Valuation: $400</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-full border px-1.5 py-0.5 md:px-2.5 text-[10px] md:text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
