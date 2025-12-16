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
import { useAI } from "@/components/ai/ai-provider"
import { useRouter } from "next/navigation"

const initialState: ValuationState = { message: null, errors: {} }

export default function PawnItemPage() {
    const [state, formAction, isPending] = useActionState(submitValuationRequest, initialState)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const { notify } = useAI()

    // Monitor state changes for success/error toast
    if (state.message) {
        if (state.message === "success" && !success) {
            setSuccess(true)
            notify("Request submitted successfully!", undefined, undefined, "success")
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


    // State for dynamic fields
    const [selectedType, setSelectedType] = useState<string>("ELECTRONICS")

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500">
                    Get a Valuation
                </h1>
                <p className="text-muted-foreground mt-2">
                    Submit your asset details. The more info you provide, the more accurate our initial offer.
                </p>
            </div>

            <form action={formAction} className="space-y-6">

                {/* 1. Asset Type */}
                <Card className="glass-card border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Asset Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="category">What are you pawning?</Label>
                            <Select name="category" defaultValue={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ELECTRONICS">Electronics (Phones, Laptops)</SelectItem>
                                    <SelectItem value="VEHICLE">Motor Vehicle (Cars, Trucks)</SelectItem>
                                    <SelectItem value="JEWELRY">Jewelry (Gold, Diamonds)</SelectItem>
                                    <SelectItem value="COLLECTIBLE">Collectibles (Art, Antiques)</SelectItem>
                                    <SelectItem value="FURNITURE">Furniture</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Core Details */}
                <Card className="glass-card border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name / Title</Label>
                                <Input id="name" name="name" placeholder={selectedType === "VEHICLE" ? "e.g. 2018 Toyota Hilux" : "e.g. iPhone 14 Pro"} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yearOfPurchase">Year of Purchase / Manufacture</Label>
                                <Input type="number" id="yearOfPurchase" name="yearOfPurchase" placeholder="YYYY" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Detailed Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Include defects, accessories included, or special features..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select name="condition" defaultValue="USED">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEW">New (Sealed/Unused)</SelectItem>
                                        <SelectItem value="LIKE_NEW">Like New (Mint)</SelectItem>
                                        <SelectItem value="USED">Used (Normal Wear)</SelectItem>
                                        <SelectItem value="DAMAGED">Damaged / Needs Repair</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimatedValue">Your Estimate ($)</Label>
                                <Input type="number" id="estimatedValue" name="estimatedValue" placeholder="e.g. 500.00" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Dynamic Fields based on Type */}
                {selectedType === "VEHICLE" && (
                    <Card className="glass-card border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle>Vehicle Details</CardTitle>
                            <CardDescription>Required for accurate vehicle valuation</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vin">VIN / Chassis Number</Label>
                                <Input id="vin" name="vin" required placeholder="17-character VIN" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mileage">Mileage (km)</Label>
                                <Input type="number" id="mileage" name="mileage" required placeholder="e.g. 120000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registrationNumber">Registration Number</Label>
                                <Input id="registrationNumber" name="registrationNumber" placeholder="Number Plate" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="engineNumber">Engine Number</Label>
                                <Input id="engineNumber" name="engineNumber" placeholder="Engine Serial No." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" name="color" placeholder="e.g. White" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedType === "JEWELRY" && (
                    <Card className="glass-card border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle>Jewelry Specifics</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purity">Material / Purity</Label>
                                <Select name="purity" defaultValue="GOLD_18K">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GOLD_24K">Gold (24K)</SelectItem>
                                        <SelectItem value="GOLD_18K">Gold (18K)</SelectItem>
                                        <SelectItem value="GOLD_14K">Gold (14K)</SelectItem>
                                        <SelectItem value="SILVER">Silver</SelectItem>
                                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                                        <SelectItem value="OTHER">Other Gemstone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (Grams or Carats)</Label>
                                <Input type="number" step="0.01" id="weight" name="weight" placeholder="e.g. 10.5" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(selectedType === "FURNITURE" || selectedType === "OTHER") && (
                    <Card className="glass-card border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle>Dimensions & Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dimensions">Dimensions (Height x Width x Depth)</Label>
                                <Input id="dimensions" name="dimensions" placeholder="e.g. 2m x 1.5m x 0.8m" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 4. Images */}
                <Card className="glass-card border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Photos (Min 4)</CardTitle>
                        <CardDescription>Front, Back, Labels, and Defects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer text-center">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm font-medium">Click to upload photos</p>
                            <p className="text-xs text-muted-foreground mt-1">Accepts JPG, PNG (Max 5MB)</p>
                            <input type="hidden" name="mock-image" value="true" />
                        </div>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white h-12 text-lg font-bold shadow-lg"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Submission...
                        </>
                    ) : "Submit Asset for Valuation"}
                </Button>

                {state.message && state.message !== "success" && (
                    <div className="bg-red-500/10 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                        {state.message}
                    </div>
                )}
            </form>
        </div>
    )
}
