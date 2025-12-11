"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface PawnTicketProps {
    loan: any
    customer: any
    items: any[]
    signatureUrl?: string | null
    ticketRef?: string
}

export function PawnTicket({ loan, customer, items, signatureUrl, ticketRef: verificationRef }: PawnTicketProps) {
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

    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/ticket/${verificationRef || loan.id}`
        : `https://realtimecapital.com/verify/ticket/${verificationRef || loan.id}`

    return (
        <div>
            <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Download Ticket
            </Button>

            {/* Hidden Printable Area */}
            <div className="absolute top-0 left-[-9999px]">
                <div ref={ticketRef} className="w-[595pt] min-h-[842pt] bg-white text-black p-12 font-serif text-sm relative">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                        <div>
                            <h1 className="text-3xl font-bold uppercase mb-2">Cashpoint</h1>
                            <p>123 Borrowdale Road, Harare, Zimbabwe</p>
                            <p>Tel: +263 77 123 4567 | Reg: 1234/2024</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <QRCodeSVG value={verificationUrl} size={80} />
                            <p className="text-[10px] mt-1 font-mono">{verificationRef || loan.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-6 text-center uppercase border-black bg-slate-100 py-2 border-y">Pawn Agreement & Disclosure</h2>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold border-b border-black mb-2 uppercase text-xs">Pledgor (Customer)</h3>
                            <div className="space-y-1">
                                <p><span className="font-bold w-24 inline-block">Name:</span> {customer.name || customer.firstName + " " + customer.lastName}</p>
                                <p><span className="font-bold w-24 inline-block">Email:</span> {customer.email}</p>
                                <p><span className="font-bold w-24 inline-block">ID Number:</span> {customer.idNumber || customer.nationalId || "N/A"}</p>
                                <p><span className="font-bold w-24 inline-block">Address:</span> {customer.address || "Harare, ZW"}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold border-b border-black mb-2 uppercase text-xs">Transaction Details</h3>
                            <div className="space-y-1">
                                <p><span className="font-bold w-24 inline-block">Ticket #:</span> {loan.id.slice(0, 8).toUpperCase()}</p>
                                <p><span className="font-bold w-24 inline-block">Date:</span> {new Date(loan.createdAt).toLocaleDateString()}</p>
                                <p><span className="font-bold w-24 inline-block">Due Date:</span> {new Date(new Date(loan.createdAt).setDate(new Date(loan.createdAt).getDate() + loan.duration)).toLocaleDateString()}</p>
                                <p><span className="font-bold w-24 inline-block">Ref:</span> {verificationRef || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Item Description */}
                    <div className="mb-8">
                        <h3 className="font-bold border-b border-black mb-2 uppercase text-xs">Pledged Goods Description</h3>
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-black bg-slate-50">
                                    <th className="py-2 pl-2">Item</th>
                                    <th className="py-2">Description / Serial</th>
                                    <th className="py-2 pr-2 text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items && items.map((item, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 pl-2 font-bold">{item.title || item.name}</td>
                                        <td className="py-2">{item.description} {item.serialNumber && `(SN: ${item.serialNumber})`}</td>
                                        <td className="py-2 pr-2 text-right">${Number(loan.principalAmount || loan.principal).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Terms */}
                    <div className="mb-8 bg-slate-50 p-4 border border-slate-200 rounded">
                        <h3 className="font-bold border-b border-black mb-4 uppercase text-xs">Financial Terms</h3>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Principal Amount:</span>
                                <span className="font-bold">${Number(loan.principalAmount || loan.principal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Interest Rate:</span>
                                <span>{Number(loan.interestRate)}% / {loan.duration || 30} Days</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Storage/Admin Fees:</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t border-black pt-2 mt-2">
                                <span>Total Repayment:</span>
                                <span>${(Number(loan.principalAmount || loan.principal) * (1 + Number(loan.interestRate) / 100)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Legal Text */}
                    <div className="text-[10px] text-justify leading-tight mb-8">
                        <p className="mb-2"><strong>1. PLEDGE & SECURITY:</strong> The Pledgor hereby deposits the described goods with Cashpoint ("Pawnbroker") as security for the loan. The Pledgor warrants they are the sole owner of these goods and they are free of encumbrances.</p>
                        <p className="mb-2"><strong>2. REDEMPTION PERIOD:</strong> The loan must be redeemed by the Due Date specified. Interest accrues daily. Redemption requires payment of principal plus all accrued interest and fees.</p>
                        <p className="mb-2"><strong>3. FORFEITURE & SALE:</strong> Failure to redeem the pledge by the Due Date + Grace Period (if applicable) results in forfeiture. The Pawnbroker acquires absolute title and may sell/auction the goods to recover the debt without further notice. Proceeds above the debt + costs may be claimable by the Pledgor within statutory limits.</p>
                        <p className="mb-2"><strong>4. LIABILITY:</strong> The Pawnbroker is not liable for loss or damage caused by fire, theft, burglary, or events beyond reasonable control, provided reasonable care was exercised.</p>
                        <p><strong>5. GOVERNING LAW:</strong> This agreement is governed by the laws of Zimbabwe. Any disputes shall be resolved in Harare courts.</p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-12 items-end">
                        <div className="border-t border-black pt-2">
                            {signatureUrl ? (
                                <img src={signatureUrl} alt="Customer Signature" className="h-12 mb-2 object-contain" />
                            ) : (
                                <div className="h-12 mb-2"></div>
                            )}
                            <p className="text-xs uppercase font-bold">Pledgor Signature</p>
                            <p className="text-[10px]">I accept the terms above</p>
                        </div>
                        <div className="border-t border-black pt-2">
                            <div className="h-12 mb-2 flex items-end font-script text-lg">
                                Cashpoint
                            </div>
                            <p className="text-xs uppercase font-bold">Authorized Representative</p>
                            <p className="text-[10px]">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-[10px] text-gray-500 border-t pt-2">
                        System Generated Ticket • Cashpoint • {verificationRef || loan.id}
                    </div>
                </div>
            </div>
        </div>
    )
}
