"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useActionState } from "react"
import { createLoan } from "@/app/actions/loans"
import { CheckCircle2, ChevronRight, Camera, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { DigitalSignaturePad } from "@/components/compliance/digital-signature-pad"

// Types for detailed valuation
type ValuationAttributes = {
    artist?: string
    dimensions?: string
    medium?: string
    provenance?: string
    condition?: string
    year?: string
    authenticity?: "Certificate" | "Receipt" | "None"
    // Digital / IP
    rotation?: string
    type?: string
    accessories?: string
    platform?: string
    revenue?: string
}

interface WizardFormProps {
    user: any // Typed as any to avoid complex Prisma imports in client, but ideally User
}

export default function WizardForm({ user }: WizardFormProps) {
    console.log("Rendering WizardForm", { userVerified: user?.verificationStatus })
    const [step, setStep] = useState(1)
    const [category, setCategory] = useState("")
    const [signature, setSignature] = useState<string | null>(null)
    const [idFileName, setIdFileName] = useState<string | null>(null)
    const [itemFileName, setItemFileName] = useState<string | null>(null)

    // Auto-fill personal details if user exists
    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        itemDescription: "",
        valuation: "",
        brand: "",
        model: "",
        serialNumber: "",
        // Personal - Auto-fill from user session if available
        firstName: user?.name?.split(" ")[0] || "",
        lastName: user?.name?.split(" ").slice(1).join(" ") || "",
        nationalId: user?.nationalId || "", // Assuming extended user schema
        phoneNumber: user?.phoneNumber || "",
        images: "[]",
    })

    const isVerified = user?.verificationStatus === "VERIFIED"

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
    const [state, formAction] = useActionState(createLoan, initialState)

    // Monitor form state for errors or success
    useEffect(() => {
        if (state?.message) {
            // If failed, maybe show toast? For now validation errors appear inline potentially?
            // Actually our createLoan returns { message, errors }.
        }
    }, [state])

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

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
                </div>
            )
        }
        if (category === "Digital Media") {
            return (
                <div className="grid gap-4 mt-4 border-l-2 border-amber-500 pl-4">
                    <h4 className="text-sm font-semibold text-amber-500">Equipment Details</h4>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select onValueChange={(val) => handleAttributeChange("type", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Camera">Camera / Lens</SelectItem>
                                    <SelectItem value="Laptop">High-end Laptop</SelectItem>
                                    <SelectItem value="Drone">Drone</SelectItem>
                                    <SelectItem value="Studio Gear">Studio Gear</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Condition (Shutter Count/Cycle)</Label>
                                <Input placeholder="e.g. < 10k clicks" onChange={(e) => handleAttributeChange("condition", e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Accessories</Label>
                                <Input placeholder="Charger, Bag, etc." onChange={(e) => handleAttributeChange("accessories", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        if (category === "IP / Rights") {
            return (
                <div className="grid gap-4 mt-4 border-l-2 border-amber-500 pl-4">
                    <h4 className="text-sm font-semibold text-amber-500">Intellectual Property</h4>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Platform / Source</Label>
                            <Input placeholder="YouTube, Spotify, Patent, etc." onChange={(e) => handleAttributeChange("platform", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Monthly Revenue ($)</Label>
                                <Input type="number" placeholder="0.00" onChange={(e) => handleAttributeChange("revenue", e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Ownership Proof</Label>
                                <Select onValueChange={(val) => handleAttributeChange("authenticity", val as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Proof" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Certificate">Registration Cert</SelectItem>
                                        <SelectItem value="Receipt">Dashboard Access</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    if (state?.message === "Application Submitted Successfully!") {
        return (
            <Card className="border-green-200 dark:border-green-900 shadow-xl bg-white dark:bg-slate-950">
                <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Received!</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Your loan application for <strong>{formData.itemName}</strong> has been submitted.
                        Our team will review your item and provide a final valuation shortly.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <Link href="/portal">
                            <Button variant="outline">Go to Dashboard</Button>
                        </Link>
                        <Link href="/portal/loans">
                            <Button>View My Loans</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur">
            <form action={formAction}>
                {/* State Feedback */}
                {state.message && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-t-lg border-b border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900">
                        <p className="font-bold">{state.message}</p>
                        {state.errors && (
                            <ul className="list-disc list-inside mt-2 text-sm">
                                {Object.entries(state.errors).map(([key, messages]) => (
                                    <li key={key}>
                                        <span className="capitalize">{key}:</span> {messages && (messages as string[]).join(", ")}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Hidden utility fields & Data Persistence for Multi-step */}
                {/* We must replicate ALL fields here as hidden inputs because unmounted steps don't submit data */}
                <input type="hidden" name="itemName" value={formData.itemName} />
                <input type="hidden" name="category" value={formData.category} />
                <input type="hidden" name="itemDescription" value={formData.itemDescription} />
                <input type="hidden" name="valuation" value={formData.valuation} />
                <input type="hidden" name="brand" value={formData.brand} />
                <input type="hidden" name="model" value={formData.model} />
                <input type="hidden" name="serialNumber" value={formData.serialNumber} />

                <input type="hidden" name="firstName" value={formData.firstName} />
                <input type="hidden" name="lastName" value={formData.lastName} />
                <input type="hidden" name="nationalId" value={formData.nationalId} />
                <input type="hidden" name="phoneNumber" value={formData.phoneNumber} />

                <input type="hidden" name="principalAmount" value={Number(formData.valuation || 0) * 0.5} />
                <input type="hidden" name="interestRate" value="15" />
                <input type="hidden" name="durationDays" value="30" />
                <input type="hidden" name="valuationDetails" value={JSON.stringify(attributes)} />
                <input type="hidden" name="images" value={formData.images} />

                <CardHeader>
                    <CardTitle>
                        {step === 1 && "What are you pawning?"}
                        {step === 2 && "Item Details"}
                        {step === 3 && (isVerified ? "Confirm Details" : "Identity Verification")}
                        {step === 4 && "Review & Submit"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Choose the category that best describes your asset."}
                        {step === 2 && "Tell us more about the item's condition and value."}
                        {step === 3 && (isVerified ? "We have your verified details." : "We need to verify who you are to proceed.")}
                        {step === 4 && "Almost done! Verify your details."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {["Electronics", "Jewelry", "Vehicle", "Artwork", "Digital Media", "IP / Rights", "Equipment", "Other"].map((cat) => (
                                <div
                                    key={cat}
                                    className={`cursor-pointer p-4 rounded-xl border-2 hover:border-amber-500 transition-all flex flex-col items-center gap-2 ${category === cat ? "border-amber-500 bg-amber-500/5" : "border-slate-200 dark:border-slate-800"}`}
                                    onClick={() => {
                                        setCategory(cat)
                                        setFormData(prev => ({ ...prev, category: cat }))
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                        <span className="text-xl font-bold text-slate-500">{cat[0]}</span>
                                    </div>
                                    <span className="font-medium text-center text-sm">{cat}</span>
                                </div>
                            ))}
                            <input type="hidden" name="category" value={category} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Item Name</Label>
                                <Input name="itemName" value={formData.itemName} onChange={handleChange} required />
                            </div>

                            {/* Dynamic Attributes based on Category */}
                            {renderAttributeFields()}

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea name="itemDescription" value={formData.itemDescription} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Value ($)</Label>
                                <Input name="valuation" type="number" value={formData.valuation} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Item Photos</Label>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-md p-3">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setItemFileName(e.target.files[0].name)
                                                // In a real app, upload here. For demo, we just set a placeholder.
                                                setFormData(prev => ({ ...prev, images: JSON.stringify(["https://placehold.co/600x400?text=Uploaded+Item"]) }))
                                            }
                                        }}
                                    />
                                    {itemFileName && <p className="text-xs text-green-600 mt-1">Selected: {itemFileName}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            {isVerified ? (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-green-800 dark:text-green-400">Identity Verified</h4>
                                        <p className="text-sm text-green-700 dark:text-green-500">
                                            We have your details on file ({formData.firstName} {formData.lastName}). No further action needed.
                                        </p>
                                        {/* Hidden inputs to pass data since we aren't showing inputs */}
                                        <input type="hidden" name="firstName" value={formData.firstName} />
                                        <input type="hidden" name="lastName" value={formData.lastName} />
                                        <input type="hidden" name="nationalId" value={formData.nationalId} />
                                        <input type="hidden" name="phoneNumber" value={formData.phoneNumber} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Verification Required</AlertTitle>
                                        <AlertDescription>
                                            To prevent fraud, we require ID verification for all new clients.
                                        </AlertDescription>
                                    </Alert>

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
                                        <Input name="nationalId" value={formData.nationalId} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Phone Number</Label>
                                        <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                                    </div>

                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center">
                                        <Camera className="w-8 h-8 mb-2 text-slate-400" />
                                        <p className="text-sm font-medium">Upload ID Document</p>
                                        <div className="mt-2">
                                            <Label htmlFor="id-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 h-8 px-4 py-2">
                                                Choose File
                                            </Label>
                                            <Input
                                                id="id-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) setIdFileName(e.target.files[0].name)
                                                }}
                                            />
                                        </div>
                                        {idFileName && <p className="text-xs text-green-600 mt-2 font-medium">✓ {idFileName}</p>}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        You can also complete this later in your profile, but this application will remain pending.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 text-sm">
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                                <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2">Summary</h4>
                                <div className="grid grid-cols-2 gap-y-2">
                                    <span className="text-slate-500">Item:</span>
                                    <span className="font-medium">{formData.itemName}</span>
                                    <span className="text-slate-500">Value:</span>
                                    <span className="font-medium">${formData.valuation}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Digital Signature</Label>
                                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                                    <p className="text-xs text-slate-500 mb-2">
                                        By signing below, you agree to the Terms of Service and acknowledge that this is a binding loan application.
                                    </p>
                                    <DigitalSignaturePad onSave={(data) => setSignature(data)} />
                                    {signature && <p className="text-xs text-green-600 mt-2">Signature captured!</p>}
                                    <input type="hidden" name="signatureUrl" value={signature || ""} />
                                </div>
                            </div>

                            <p className="text-center text-slate-500 text-xs">
                                By clicking submit, you apply for a loan.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <Button type="button" onClick={nextStep} disabled={step === 1 && !category}>
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto" disabled={!signature}>
                            {signature ? "Submit Application" : "Sign to Submit"}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    )
}
