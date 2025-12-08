import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadReportButton } from "@/components/admin/download-report-button"
import { getLoanBookReport, getAuctionSalesReport, getUserDirectoryReport } from "@/app/actions/admin/reports"
import { FileBarChart, Users, DollarSign, BookOpen } from "lucide-react"

export default async function AdminReportsPage() {
    const session = await auth()
    const user = session?.user as any

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        redirect("/portal")
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports Center</h1>
                    <p className="text-slate-500 mt-1">Generate and download system audits and financial reports.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Loan Book */}
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle>Loan Book</CardTitle>
                        <CardDescription>All active loans, debts, and collateral status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DownloadReportButton
                            reportName="Download Loan CSV"
                            fetchData={getLoanBookReport}
                            fileName="loan_book_report"
                        />
                    </CardContent>
                </Card>

                {/* Sales Report */}
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle>Auction Sales</CardTitle>
                        <CardDescription>Completed sales, revenue, and item details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DownloadReportButton
                            reportName="Download Sales CSV"
                            fetchData={getAuctionSalesReport}
                            fileName="auction_sales_report"
                        />
                    </CardContent>
                </Card>

                {/* User Directory */}
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <CardTitle>User Directory</CardTitle>
                        <CardDescription>User list with KYC status and current roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DownloadReportButton
                            reportName="Download Users CSV"
                            fetchData={getUserDirectoryReport}
                            fileName="user_directory_report"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
