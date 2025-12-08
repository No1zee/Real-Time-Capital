"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Printer } from "lucide-react"

interface PawnTicketProps {
    loan: any // We'll type this properly or use 'any' for speed now
    user: any
}

export function PawnTicket({ loan, user }: PawnTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)

    const handlePrint = async () => {
        if (!ticketRef.current) return

        const canvas = await html2canvas(ticketRef.current, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        })

        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`PawnTicket-${loan.id}.pdf`)
    }

    return (
        <div>
            <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Download Ticket
            </Button>

            {/* Hidden Printable Area */}
            <div className="absolute top-0 left-[-9999px]">
                <div ref={ticketRef} className="w-[595pt] min-h-[842pt] bg-white text-black p-12 font-serif text-sm">
                    {/* Header */}
                    <div className="text-center mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-3xl font-bold uppercase mb-2">Real Time Capital</h1>
                        <p>123 Borrowdale Road, Harare, Zimbabwe</p>
                        <p>Tel: +263 77 123 4567 | Reg: 1234/2024</p>
                        <h2 className="text-xl font-bold mt-4 uppercase">Pawn Agreement & Disclosure</h2>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold border-b border-black mb-2">Pledgor (Customer)</h3>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>ID Number:</strong> {user.idNumber || "N/A"}</p>
                            <p><strong>Address:</strong> {user.address || "Harare, ZW"}</p>
                        </div>
                        <div>
                            <h3 className="font-bold border-b border-black mb-2">Transaction Details</h3>
                            <p><strong>Ticket #:</strong> {loan.id.slice(0, 8).toUpperCase()}</p>
                            <p><strong>Date:</strong> {new Date(loan.createdAt).toLocaleDateString()}</p>
                            <p><strong>Due Date:</strong> {new Date(new Date(loan.createdAt).setDate(new Date(loan.createdAt).getDate() + loan.duration)).toLocaleDateString()}</p>
                            <p><strong>Served By:</strong> Admin Staff</p>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="mb-8">
                        <h3 className="font-bold border-b border-black mb-2">Pledged Goods Description</h3>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="py-2">Item</th>
                                    <th className="py-2">Description / Serial</th>
                                    <th className="py-2">Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-300">
                                    <td className="py-2 font-bold">{loan.item.title}</td>
                                    <td className="py-2">{loan.item.description}</td>
                                    <td className="py-2">${loan.principal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Terms */}
                    <div className="mb-8">
                        <h3 className="font-bold border-b border-black mb-2">Financial Terms</h3>
                        <div className="flex justify-between text-lg">
                            <span>Principal Amount:</span>
                            <span className="font-bold">${loan.principal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Interest Rate:</span>
                            <span>{loan.interestRate}% / {loan.duration} Days</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Storage/Admin Fees:</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold mt-4 pt-2 border-t border-black">
                            <span>Total Amount Due:</span>
                            <span>${(loan.principal * (1 + loan.interestRate / 100)).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Legal Text */}
                    <div className="text-xs text-justify leading-tight mb-12">
                        <p className="mb-2"><strong>1. TERMS OF PLEDGE:</strong> The Pledgor hereby pledges the goods described above as security for the loan amount. The Pledgor warrants that they are the legal owner of the goods and have the right to pledge them.</p>
                        <p className="mb-2"><strong>2. REDEMPTION:</strong> The loan must be repaid in full, including interest, on or before the Due Date. Failure to redeem the goods by the Due Date may result in the goods being sold to recover the debt.</p>
                        <p className="mb-2"><strong>3. DEFAULT:</strong> If the loan is not repaid by the Due Date, title to the goods shall pass to the Pawnbroker, who may sell the goods at public or private sale.</p>
                        <p><strong>4. LOSS/DAMAGE:</strong> The Pawnbroker is not responsible for loss or damage to pledged goods due to fire, theft, or other causes beyond their control, unless due to negligence.</p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-12">
                        <div className="border-t border-black pt-2">
                            <p className="mb-8">Use Signature ______________________</p>
                            <p><strong>Pledgor Signature</strong></p>
                        </div>
                        <div className="border-t border-black pt-2">
                            <p className="mb-8">Auth Signature ______________________</p>
                            <p><strong>Authorized Representative</strong></p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-xs text-gray-500">
                        Generated by Real Time Capital System on {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
