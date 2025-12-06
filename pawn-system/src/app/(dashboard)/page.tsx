import { Banknote, Gavel, Package, Users, TrendingUp, AlertCircle } from "lucide-react"

const stats = [
    { name: "Total Active Loans", value: "$45,231.89", icon: Banknote, change: "+20.1%", trend: "up" },
    { name: "Items in Inventory", value: "356", icon: Package, change: "+180", trend: "up" },
    { name: "Active Auctions", value: "12", icon: Gavel, change: "-2", trend: "down" },
    { name: "Total Customers", value: "2,300", icon: Users, change: "+45", trend: "up" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your pawn shop operations.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{stat.name}</h3>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="content-center">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                                    {stat.change}
                                </span>{" "}
                                from last month
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Loans</h3>
                        <p className="text-sm text-muted-foreground">Latest transactions processed today.</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Banknote className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Loan #{1000 + i}</p>
                                        <p className="text-sm text-muted-foreground">Customer Name</p>
                                    </div>
                                    <div className="ml-auto font-medium">+$250.00</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight">Pending Approvals</h3>
                        <p className="text-sm text-muted-foreground">Loans requiring manager review.</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Gold Necklace 18k</p>
                                        <p className="text-xs text-muted-foreground">Valuation: $400</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
