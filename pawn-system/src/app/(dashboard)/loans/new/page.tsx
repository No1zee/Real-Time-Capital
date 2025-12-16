"use client"

import { useState, useActionState, useMemo, useEffect } from "react"
import { ArrowLeft, Upload, Loader2, CheckCircle2, Camera, X } from "lucide-react"
import { useAI } from "@/components/ai/ai-provider"
import Link from "next/link"
import { createLoan, State } from "@/app/actions/loans"
import { ITEM_CATEGORIES, COMMON_ITEMS } from "@/lib/constants"

const initialState: State = { message: null, errors: {} }

export default function NewLoanPage() {
    const [step, setStep] = useState(1)
    const [state, formAction, isPending] = useActionState(createLoan, initialState)
    const { notify } = useAI()

    useEffect(() => {
        if (state.message) {
            if (state.message.includes("success")) {
                notify(state.message, undefined, undefined, "success")
            } else {
                notify(state.message, undefined, undefined, "error")
            }
        }
        if (state.errors && Object.keys(state.errors).length > 0) {
            notify("Please fix the errors in the form.", undefined, undefined, "error")
        }
    }, [state, notify])

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nationalId: "",
        phoneNumber: "",
        category: "",
        itemName: "",
        brand: "",
        model: "",
        itemDescription: "",
        serialNumber: "",
        valuation: "",
        images: "[]", // JSON string
        principalAmount: "",
        interestRate: "20", // Default 20%
        durationDays: "30", // Default 30 days
    })

    const [uploadedImages, setUploadedImages] = useState<string[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Smart Dropdown Logic
    const itemSuggestions = useMemo(() => {
        if (!formData.category || formData.category === "Other") return []
        const category = formData.category as keyof typeof COMMON_ITEMS
        return COMMON_ITEMS[category] || []
    }, [formData.category])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // In a real app, upload to S3/Cloudinary. Here we use base64 for local demo.
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                const newImages = [...uploadedImages, base64String]
                setUploadedImages(newImages)
                setFormData(prev => ({ ...prev, images: JSON.stringify(newImages) }))
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index)
        setUploadedImages(newImages)
        setFormData(prev => ({ ...prev, images: JSON.stringify(newImages) }))
    }

    // Calculations
    const principal = parseFloat(formData.principalAmount) || 0
    const rate = parseFloat(formData.interestRate) || 0
    const duration = parseInt(formData.durationDays) || 0

    const interestAmount = (principal * rate) / 100
    const totalRepayment = principal + interestAmount

    const startDate = new Date()
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + duration)

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-10">
            <div className="flex items-center space-x-4">
                <Link href="/loans" className="p-2 hover:bg-accent rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Loan Application</h2>
                    <p className="text-muted-foreground">Create a new pawn loan for a customer.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Progress Steps */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-between">
                        {["Customer Details", "Item Valuation", "Loan Terms", "Review"].map((label, index) => {
                            const stepNum = index + 1
                            const isActive = step >= stepNum
                            return (
                                <div key={label} className="flex flex-col items-center">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors ${isActive ? "border-primary text-primary" : "border-muted text-muted-foreground"}`}>
                                        <span className="text-sm font-medium">{stepNum}</span>
                                    </div>
                                    <span className="mt-2 text-xs font-medium text-muted-foreground">{label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <form action={formAction} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.firstName ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                        placeholder="John"
                                    />
                                    {state.errors?.firstName && <p className="text-sm text-destructive">{state.errors.firstName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.lastName ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                        placeholder="Doe"
                                    />
                                    {state.errors?.lastName && <p className="text-sm text-destructive">{state.errors.lastName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">National ID</label>
                                    <input
                                        name="nationalId"
                                        value={formData.nationalId}
                                        onChange={handleInputChange}
                                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.nationalId ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                        placeholder="63-123456-A-78"
                                    />
                                    {state.errors?.nationalId && <p className="text-sm text-destructive">{state.errors.nationalId}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state.errors?.phoneNumber ? "border-destructive focus-visible:ring-destructive" : "border-input"}`}
                                        placeholder="+263 77 123 4567"
                                    />
                                    {state.errors?.phoneNumber && <p className="text-sm text-destructive">{state.errors.phoneNumber}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Item Details & Valuation</h3>

                            {/* Category Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Select a category...</option>
                                    {ITEM_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Item Name</label>
                                    <input
                                        list="item-suggestions"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. iPhone 15"
                                    />
                                    <datalist id="item-suggestions">
                                        {itemSuggestions.map(item => (
                                            <option key={item} value={item} />
                                        ))}
                                    </datalist>
                                    {state.errors?.itemName && <p className="text-sm text-destructive">{state.errors.itemName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Brand (Optional)</label>
                                    <input
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. Apple"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Model (Optional)</label>
                                    <input
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. A2890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Serial Number</label>
                                    <input
                                        name="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="SN123456789"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Description & Condition</label>
                                <textarea
                                    name="itemDescription"
                                    value={formData.itemDescription}
                                    onChange={handleInputChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Describe the item condition, scratches, accessories included..."
                                />
                                {state.errors?.itemDescription && <p className="text-sm text-destructive">{state.errors.itemDescription}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Estimated Value ($)</label>
                                <input
                                    type="number"
                                    name="valuation"
                                    value={formData.valuation}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="0.00"
                                />
                                {state.errors?.valuation && <p className="text-sm text-destructive">{state.errors.valuation}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Item Photos</label>
                                <div className="flex flex-wrap gap-4">
                                    {uploadedImages.map((img, index) => (
                                        <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border">
                                            <img src={img} alt="Item" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md hover:bg-black/70"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed hover:bg-accent/50">
                                        <Camera className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground mt-1">Add</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <input type="hidden" name="images" value={formData.images} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Loan Terms</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Principal Amount ($)</label>
                                    <input
                                        type="number"
                                        name="principalAmount"
                                        value={formData.principalAmount}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="0.00"
                                    />
                                    {state.errors?.principalAmount && <p className="text-sm text-destructive">{state.errors.principalAmount}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        name="interestRate"
                                        value={formData.interestRate}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Duration (Days)</label>
                                    <input
                                        type="number"
                                        name="durationDays"
                                        value={formData.durationDays}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Due Date</label>
                                    <input
                                        disabled
                                        value={dueDate.toLocaleDateString()}
                                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Principal:</span>
                                    <span className="font-medium">${principal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Interest ({rate}%):</span>
                                    <span className="font-medium">${interestAmount.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border my-2 pt-2 flex justify-between font-bold">
                                    <span>Total Repayment:</span>
                                    <span>${totalRepayment.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Review Application</h3>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                                        <p><span className="font-medium">ID:</span> {formData.nationalId}</p>
                                        <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Item</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Item:</span> {formData.itemName}</p>
                                        <p><span className="font-medium">Category:</span> {formData.category}</p>
                                        <p><span className="font-medium">Value:</span> ${parseFloat(formData.valuation).toFixed(2)}</p>
                                        <p><span className="font-medium">SN:</span> {formData.serialNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Loan Details</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-muted-foreground text-xs">Principal</p>
                                        <p className="font-bold text-lg">${principal.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-muted-foreground text-xs">Interest</p>
                                        <p className="font-bold text-lg">${interestAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-muted-foreground text-xs">Total Due</p>
                                        <p className="font-bold text-lg text-primary">${totalRepayment.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>



                            {/* Hidden inputs to submit data */}
                            {Object.entries(formData).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value} />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1 || isPending}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Back
                        </button>

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep(Math.min(4, step + 1))}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[140px]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
