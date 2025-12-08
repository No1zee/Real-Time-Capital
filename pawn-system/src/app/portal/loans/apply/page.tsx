"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormState } from "react-dom"
import { createLoan } from "@/app/actions/loans"
import { Loader2, CheckCircle2, ChevronRight, Upload, Camera } from "lucide-react"

// Types for detailed valuation
type ValuationAttributes = {
    artist?: string
    dimensions?: string
    medium?: string
    provenance?: string
    condition?: string
    year?: string
    authenticity?: "Certificate" | "Receipt" | "None"
}

export default function QuickApplyPage() {
    const [step, setStep] = useState(1)
    const [category, setCategory] = useState("")
    // We are simulating "Wizard" state locally before submitting everything at the end
    // For simplicity, we wrap the whole thing in one form, and hide/show sections.
    // Or we manage state controlled inputs then submit a hidden form. Controlled inputs is safer for wizard.

    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        itemDescription: "",
        valuation: "", // Estimated Value
        brand: "",
        model: "",
        serialNumber: "",
        // Personal
        firstName: "",
        lastName: "",
        nationalId: "",
        phoneNumber: "",
        // Image Placeholders (No real upload logic in Client Action demo, assumes presigned URL or just string)
        images: "[]",
    })

    const [attributes, setAttributes] = useState<ValuationAttributes>({})

    const handleAttributeChange = (key: keyof ValuationAttributes, value: string) => {
        setAttributes(prev => ({ ...prev, [key]: value }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Server Action Binding
    const initialState = { message: "", errors: {} }
    // We need to wrap createLoan to inject our extra data which might not be in the form directly if we don't put hidden inputs
    // or we can just use hidden inputs.
    const [state, formAction] = useFormState(createLoan, initialState)

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    // Dynamic Valuation Fields based on Category
    const renderAttributeFields = () => {
        if (category === "Artwork" || category === "Creative") {
            return (
                <div className="grid gap-4 mt-4 border-l-2 border-amber-500 pl-4">
                    <h4 className="text-sm font-semibold text-amber-500">Artwork Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Artist / Creator</Label>
                            <Input placeholder="e.g. Dominic Benhura" onChange={(e) => handleAttributeChange("artist", e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Year (Approx)</Label>
                            <Input placeholder="e.g. 1998" onChange={(e) => handleAttributeChange("year", e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Provenance (History)</Label>
                        <Textarea placeholder="Where was it bought? Previous owners?" onChange={(e) => handleAttributeChange("provenance", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Proof of Authenticity</Label>
                        <Select onValueChange={(v: any) => handleAttributeChange("authenticity", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Do you have papers?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Certificate">Certificate of Authenticity</SelectItem>
                                <SelectItem value="Receipt">Original Receipt</SelectItem>
                                <SelectItem value="None">None / Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    Quick Capital Application
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Get a preliminary offer for your assets in minutes.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white dark:bg-slate-950 font-bold ${step >= s ? "border-amber-500 text-amber-500" : "border-slate-300 text-slate-300"}`}>
                        {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                    </div>
                ))}
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur">
                <form action={formAction}>
                    {/* Hidden utility fields required by server action */}
                    {/* We auto-calculate dummy principal/interest for the APPLICATION phase. Adjust later. */}
                    <input type="hidden" name="principalAmount" value={Number(formData.valuation || 0) * 0.5} />
                    <input type="hidden" name="interestRate" value="15" />
                    <input type="hidden" name="durationDays" value="30" />
                    <input type="hidden" name="valuationDetails" value={JSON.stringify(attributes)} />
                    <input type="hidden" name="images" value={formData.images} />

                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "What are you pawning?"}
                            {step === 2 && "Item Details"}
                            {step === 3 && "Your Contact Info"}
                            {step === 4 && "Review & Submit"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Choose the category that best describes your asset."}
                            {step === 2 && "Tell us more about the item's condition and value."}
                            {step === 3 && "We need this to contact you with an offer."}
                            {step === 4 && "Almost done! Verify your details."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {["Electronics", "Jewelry", "Vehicle", "Artwork", "Equipment", "Other"].map((cat) => (
                                    <div
                                        key={cat}
                                        className={`cursor-pointer p-4 rounded-xl border-2 hover:border-amber-500 transition-all flex flex-col items-center gap-2 ${category === cat ? "border-amber-500 bg-amber-500/5" : "border-slate-200 dark:border-slate-800"}`}
                                        onClick={() => {
                                            setCategory(cat)
                                            setFormData(prev => ({ ...prev, category: cat }))
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                            {/* We could use icons here */}
                                            <span className="text-xl font-bold text-slate-500">
                                                {cat[0]}
                                            </span>
                                        </div>
                                        <span className="font-medium">{cat}</span>
                                    </div>
                                ))}
                                {/* Hidden input for form submission */}
                                <input type="hidden" name="category" value={category} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Item Name / Title</Label>
                                    <Input name="itemName" placeholder="e.g. MacBook Pro M1 or 'Sunset over Zambezi'" value={formData.itemName} onChange={handleChange} required />
                                </div>

                                {renderAttributeFields()}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Brand (Optional)</Label>
                                        <Input name="brand" value={formData.brand} onChange={handleChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Model (Optional)</Label>
                                        <Input name="model" value={formData.model} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Description & Condition</Label>
                                    <Textarea name="itemDescription" placeholder="Any scratches? Working perfectly?" value={formData.itemDescription} onChange={handleChange} required />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Estimated Value ($)</Label>
                                    <Input name="valuation" type="number" placeholder="How much do you think it's worth?" value={formData.valuation} onChange={handleChange} required />
                                </div>

                                {/* Placeholder Image Upload UI */}
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center text-center text-slate-500">
                                    <Camera className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="font-medium">Upload Photos</p>
                                    <p className="text-xs">Clear photos increase your chance of a high offer. (Skipped for demo)</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>First Name</Label>
                                        <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Last Name</Label>
                                        <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>National ID</Label>
                                    <Input name="nationalId" placeholder="63-1234567-T-07" value={formData.nationalId} onChange={handleChange} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input name="phoneNumber" placeholder="+263 7..." value={formData.phoneNumber} onChange={handleChange} required />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 text-sm">
                                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                                    <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2">Application Summary</h4>
                                    <div className="grid grid-cols-2 gap-y-2">
                                        <span className="text-slate-500">Item:</span>
                                        <span className="font-medium">{formData.itemName} ({category})</span>
                                        <span className="text-slate-500">Estimated Value:</span>
                                        <span className="font-medium">${formData.valuation}</span>
                                        <span className="text-slate-500">Applicant:</span>
                                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                </div>
                                <p className="text-center text-slate-500">
                                    By clicking submit, you agree to our terms. Our team will review your application and contact you within 2 hours.
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                Back
                            </Button>
                        ) : <div></div>}

                        {step < 4 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                disabled={step === 1 && !category}
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto">
                                Check Eligibility & Apply
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
