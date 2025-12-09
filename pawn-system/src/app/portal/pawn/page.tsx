"use client"

import { useActionState, useState } from "react"
import { submitValuationRequest, ValuationState } from "@/app/actions/valuation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const initialState: ValuationState = { message: null, errors: {} }

export default function PawnItemPage() {
    const [state, formAction, isPending] = useActionState(submitValuationRequest, initialState)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    // Monitor state changes for success/error toast
    if (state.message) {
        if (state.message === "success" && !success) {
            setSuccess(true)
            toast.success("Request submitted successfully!")
            setTimeout(() => router.push("/portal"), 2000)
        } else if (state.message !== "success") {
            // Avoid toast spam loop, rely on inline errors for now or simple check
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Submission Received!</h2>
                <p className="text-muted-foreground max-w-md">
                    Our experts will review your item and provide a valuation within 24 hours. You can track the status in your dashboard.
                </p>
                <Button onClick={() => router.push("/portal")} variant="outline">Back to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500">
                    Get a Valuation
                </h1>
                <p className="text-muted-foreground mt-2">
                    Upload details of your item to get a preliminary loan offer.
                </p>
            </div>

            <Card className="glass-card border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                    <CardDescription>Tell us about what you want to pawn</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" defaultValue="Electronics">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                                    <SelectItem value="Tools">Tools</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. iPhone 14 Pro Max 256GB"
                                className={state.errors?.name ? "border-red-500" : ""}
                            />
                            {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Condition, Accessories, etc.)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the condition, included accessories, or any defects..."
                                className={`min-h-[100px] ${state.errors?.description ? "border-red-500" : ""}`}
                            />
                            {state.errors?.description && <p className="text-xs text-red-500">{state.errors.description[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Photos</Label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer text-center">
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">Mock Upload (Files won't be saved in this demo)</p>
                                {/* Hidden input for functionality simulation */}
                                <input type="hidden" name="mock-image" value="true" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : "Submit for Valuation"}
                        </Button>

                        {state.message && state.message !== "success" && (
                            <p className="text-sm text-red-500 text-center">{state.message}</p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
