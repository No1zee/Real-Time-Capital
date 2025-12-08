"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

interface DownloadReportButtonProps {
    reportName: string
    fetchData: () => Promise<any[]>
    fileName: string
}

export function DownloadReportButton({ reportName, fetchData, fileName }: DownloadReportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)
            const data = await fetchData()

            if (!data || data.length === 0) {
                alert("No data available for this report.")
                return
            }

            // Convert JSON to CSV
            const headers = Object.keys(data[0])
            const csvContent = [
                headers.join(","),
                ...data.map(row => headers.map(fieldName => {
                    const value = row[fieldName]
                    // Escape quotes and wrap in quotes if string contains comma
                    return typeof value === "string" && value.includes(",")
                        ? `"${value}"`
                        : value
                }).join(","))
            ].join("\n")

            // Create blob and download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `${fileName}.csv`)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Download failed:", error)
            alert("Failed to generate report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" onClick={handleDownload} disabled={loading} className="w-full justify-between">
            {reportName}
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Download className="h-4 w-4 ml-2" />}
        </Button>
    )
}
