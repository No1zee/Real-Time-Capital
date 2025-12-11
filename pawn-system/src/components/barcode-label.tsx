"use client"

import React, { useRef } from "react"
import Barcode from "react-barcode"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface BarcodeLabelProps {
    item: {
        id: string
        name: string
        serialNumber?: string | null
        sku?: string
    }
}

export function BarcodeLabel({ item }: BarcodeLabelProps) {
    const labelRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: labelRef,
        documentTitle: `Label-${item.id}`,
    })

    return (
        <>
            <Button variant="ghost" size="icon" onClick={() => handlePrint()} title="Print Barcode">
                <Printer className="h-4 w-4" />
            </Button>

            <div style={{ display: "none" }}>
                <div
                    ref={labelRef}
                    style={{
                        width: "50mm",
                        height: "25mm",
                        padding: "2mm",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                >
                    <p style={{ fontSize: "8px", fontWeight: "bold", margin: 0, lineHeight: 1 }}>CASHPOINT</p>
                    <p style={{ fontSize: "8px", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}>
                        {item.name.substring(0, 20)}
                    </p>
                    <div style={{ transform: "scale(0.8)", margin: "-5px 0" }}>
                        <Barcode
                            value={item.id.substring(0, 8).toUpperCase()}
                            width={1.5}
                            height={30}
                            fontSize={12}
                            displayValue={true}
                            margin={0}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
