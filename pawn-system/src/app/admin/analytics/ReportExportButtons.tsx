"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { exportRevenueToCSV } from "@/app/actions/admin/revenue-reports"
import { exportLoanAnalyticsToCSV } from "@/app/actions/admin/loan-analytics"
import { exportInventoryAnalyticsToCSV } from "@/app/actions/admin/inventory-analytics"

interface ReportExportButtonsProps {
    startDate: Date
    endDate: Date
}

export function ReportExportButtons({ startDate, endDate }: ReportExportButtonsProps) {
    const [isExporting, setIsExporting] = useState(false)

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const handleExport = async (type: 'revenue' | 'loans' | 'inventory') => {
        setIsExporting(true)
        try {
            let csv: string
            let filename: string
            const dateStr = new Date().toISOString().split('T')[0]

            if (type === 'revenue') {
                csv = await exportRevenueToCSV({ startDate, endDate })
                filename = `revenue_report_${dateStr}.csv`
            } else if (type === 'loans') {
                csv = await exportLoanAnalyticsToCSV({ startDate, endDate })
                filename = `loan_analytics_${dateStr}.csv`
            } else {
                csv = await exportInventoryAnalyticsToCSV({ startDate, endDate })
                filename = `inventory_analytics_${dateStr}.csv`
            }

            downloadCSV(csv, filename)
        } catch (error) {
            console.error("Export failed:", error)
            alert("Export failed. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('revenue')}
                disabled={isExporting}
                className="gap-2"
            >
                <Download className="h-4 w-4" />
                Revenue CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('loans')}
                disabled={isExporting}
                className="gap-2"
            >
                <FileText className="h-4 w-4" />
                Loans CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('inventory')}
                disabled={isExporting}
                className="gap-2"
            >
                <FileText className="h-4 w-4" />
                Inventory CSV
            </Button>
        </div>
    )
}
