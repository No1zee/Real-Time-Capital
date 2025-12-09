"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { exportUserData } from "@/app/actions/compliance/data-privacy"
import { Download, Shield, FileJson, Lock } from "lucide-react"

export default function DataPrivacyPage() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const data = await exportUserData()

            // Create download
            const blob = new Blob([data], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error(error)
            alert("Failed to export data. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Privacy & Data Check</h1>
                <p className="text-slate-500 mt-1">Manage your data rights and privacy settings</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-500" />
                        <CardTitle>Export Your Data</CardTitle>
                    </div>
                    <CardDescription>
                        Download a copy of all data we hold about you, including profile, transactions, and audit logs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm text-slate-600">
                        <p>Your data export will include:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Personal Profile Information</li>
                            <li>Loan History & Agreements</li>
                            <li>Transaction Records</li>
                            <li>Item Valuations & Bids</li>
                            <li>Security Logs</li>
                        </ul>
                    </div>
                    <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                        {isExporting ? "Preparing..." : "Download Data Package (JSON)"}
                        {!isExporting && <FileJson className="h-4 w-4" />}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-red-100 dark:border-red-900/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-red-600 dark:text-red-500">Account Deletion & Anonymization</CardTitle>
                    </div>
                    <CardDescription>
                        Request permanent deletion of your account and personal data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                        Due to financial regulations, we cannot immediately delete transaction records.
                        However, we can anonymize your personal information so it is no longer linked to you.
                    </p>
                    <Button variant="destructive" className="gap-2" onClick={() => alert("Please contact support to process account deletion.")}>
                        <Lock className="h-4 w-4" />
                        Request Account Deletion
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
