"use client"

import React, { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PawnTicketProps {
    loan: any // We'll type this properly
    customer: any
    items: any[]
}

export function PawnTicket({ loan, customer, items }: PawnTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)

    const generatePDF = async () => {
        if (!ticketRef.current) return

        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2, // Improve resolution
                useCORS: true
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            })

            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(`PawnTicket-${loan.id}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
        }
    }

    return (
        <div>
            <Button onClick={generatePDF} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Download Ticket
            </Button>

            {/* Hidden Ticket Template */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div ref={ticketRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 font-serif">
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">Pawn Ticket</h1>
                            <p className="text-sm font-bold">REAL TIME CAPITAL</p>
                            <p className="text-xs">123 Samora Machel Ave</p>
                            <p className="text-xs">Harare, Zimbabwe</p>
                            <p className="text-xs">+263 77 123 4567</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold">Ticket #: {loan.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs">Date: {new Date(loan.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs">Due Date: {new Date(loan.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase border-b border-slate-300 pb-1 mb-3">Pledgor Information</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><span className="font-semibold">Name:</span> {customer.name}</p>
                                <p><span className="font-semibold">Email:</span> {customer.email}</p>
                            </div>
                            <div>
                                <p><span className="font-semibold">ID Verified:</span> {customer.verificationStatus === "VERIFIED" ? "YES" : "NO"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase border-b border-slate-300 pb-1 mb-3">Pledged Goods</h2>
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-2">Item Description</th>
                                    <th className="py-2 text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-2">{item.title} - {item.description?.slice(0, 50)}...</td>
                                        <td className="py-2 text-right">${item.valuation?.toFixed(2) || "0.00"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Terms */}
                    <div className="mb-12 bg-slate-50 p-6 border border-slate-200">
                        <h2 className="text-sm font-bold uppercase mb-4">Loan Terms</h2>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <p className="font-semibold">Principal Amount:</p>
                            <p className="text-right">${loan.principal.toFixed(2)}</p>

                            <p className="font-semibold">Interest Rate (Monthly):</p>
                            <p className="text-right">{loan.interestRate}%</p>

                            <p className="font-semibold">Total Repayment Amount:</p>
                            <p className="text-right font-bold text-lg">${(loan.repaymentAmount || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="text-[10px] text-slate-600 leading-tight space-y-2 mb-12 text-justify">
                        <p>1. The Pledgor hereby acknowledges that the goods listed above have been deposited with Real Time Capital as security for the loan amount stated.</p>
                        <p>2. Failure to redeem the goods by the Due Date will result in the forfeiture of the goods to the Pawnbroker, who may then dispose of them to recover the debt.</p>
                        <p>3. Interest accrues daily/monthly as per the agreed rate. Early repayment is permitted.</p>
                        <p>4. This ticket must be produced when redeeming the pledged goods.</p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-20">
                        <div className="border-t border-slate-900 pt-2">
                            <p className="text-xs font-bold uppercase">Signature of Pledgor</p>
                        </div>
                        <div className="border-t border-slate-900 pt-2">
                            <p className="text-xs font-bold uppercase">For Real Time Capital</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
