"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileDown } from "lucide-react"

interface ExportButtonProps {
    onExportPDF?: () => Promise<void>
    onExportCSV?: () => Promise<void>
    disabled?: boolean
}

export function ExportButton({ onExportPDF, onExportCSV, disabled }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (type: 'pdf' | 'csv') => {
        setIsExporting(true)
        try {
            if (type === 'pdf' && onExportPDF) {
                await onExportPDF()
            } else if (type === 'csv' && onExportCSV) {
                await onExportCSV()
            }
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex gap-2">
            {onExportCSV && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    disabled={disabled || isExporting}
                    className="gap-2"
                >
                    <FileDown className="h-4 w-4" />
                    Export CSV
                </Button>
            )}
            {onExportPDF && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={disabled || isExporting}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export PDF
                </Button>
            )}
        </div>
    )
}
