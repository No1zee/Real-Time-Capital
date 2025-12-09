"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eraser, Save } from "lucide-react"

interface DigitalSignaturePadProps {
    onSave: (signatureData: string) => void
    isSaved?: boolean
}

export function DigitalSignaturePad({ onSave, isSaved }: DigitalSignaturePadProps) {
    const padRef = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const clear = () => {
        padRef.current?.clear()
        setIsEmpty(true)
    }

    const save = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            // Get base64 encoded png
            const data = padRef.current.getTrimmedCanvas().toDataURL("image/png")
            onSave(data)
        }
    }

    const handleBegin = () => {
        setIsEmpty(false)
    }

    if (isSaved) {
        return (
            <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-lg text-center">
                <p className="text-green-500 font-medium">Signature Captured Successfully</p>
                <p className="text-xs text-slate-400 mt-1">This signature will be applied to the digital pawn ticket.</p>
            </div>
        )
    }

    return (
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="mb-2 flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Customer Signature</h3>
                <span className="text-xs text-slate-500">Sign within the box</span>
            </div>

            <div className="border border-slate-300 dark:border-slate-700 rounded-md bg-white overflow-hidden touch-none">
                <SignatureCanvas
                    ref={padRef}
                    canvasProps={{
                        className: "w-full h-40",
                        style: { width: '100%', height: '160px' }
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                    onBegin={handleBegin}
                />
            </div>

            <div className="flex gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    disabled={isEmpty}
                    className="flex-1"
                >
                    <Eraser className="h-4 w-4 mr-2" />
                    Clear
                </Button>
                <Button
                    size="sm"
                    onClick={save}
                    disabled={isEmpty}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Signature
                </Button>
            </div>
        </Card>
    )
}
