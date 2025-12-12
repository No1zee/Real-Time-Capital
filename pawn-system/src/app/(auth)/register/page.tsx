
"use client"

import { useActionState, useState, useEffect, Suspense } from "react"
import { registerUser, RegisterState } from "@/app/actions/auth"
import { Loader2, Upload, Calendar, MapPin, Phone, User, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Info } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button" // Ensure this component exists, or use standard button

const initialState: RegisterState = {
    message: "",
    errors: {},
}

function FieldError({ errors }: { errors?: string[] }) {
    if (!errors || errors.length === 0) return null
    return (
        <p className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-in slide-in-from-top-1 fade-in duration-200">
            <Info className="h-3 w-3" />
            {errors[0]}
        </p>
    )
}


// Terms Modal Component
function TermsModal({ isOpen, onClose, onAccept }: { isOpen: boolean; onClose: () => void; onAccept: () => void }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-slate-300 text-sm">
                    <p><strong>1. Introduction</strong><br />Welcome to Cashpoint. By registering, you agree to...</p>
                    <p><strong>2. Eligibility</strong><br />You must be at least 18 years old...</p>
                    <p><strong>3. Data Privacy</strong><br />We collect your KYC data for legal compliance...</p>
                    <p><strong>4. Repayment</strong><br />Loans must be repaid by the due date...</p>
                    {/* Filler text to force scroll if needed */}
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-950">
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">Decline</Button>
                    <Button onClick={onAccept} className="bg-amber-500 text-slate-900 hover:bg-amber-400">I Agree</Button>
                </div>
            </div>
        </div>
    )
}

function RegisterWizard() {
    const [state, formAction] = useActionState(registerUser, initialState)
    const router = useRouter()

    // Step State
    const [step, setStep] = useState(1)
    const totalSteps = 4

    // Form Data State (for visual persistence between steps)
    const [formData, setFormData] = useState({
        name: "", dateOfBirth: "", nationalId: "",
        email: "", phoneNumber: "", address: "", location: "",
        password: "", confirmPassword: "",
        terms: false
    })

    const [fileName, setFileName] = useState<string | null>(null)
    const [showTerms, setShowTerms] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false) // Manual tracking for visual feedback outside formAction

    // Helper to get error
    const getError = (field: keyof NonNullable<RegisterState["errors"]>) => state.errors?.[field]
    const getInputClass = (field: keyof NonNullable<RegisterState["errors"]>) =>
        `input-field ${getError(field) ? "border-red-500 focus:border-red-500 bg-red-900/10 text-red-100 placeholder:text-red-400/50" : ""}`


    useEffect(() => {
        if (state.message) {
            setIsSubmitting(false) // Reset loading
            if (state.message === "success-otp") {
                // Success! Redirect to verify-otp
                // Pass email to query param
                // We need the email used. It's in formData.
                toast.success("Registration Successful! Please verify your OTP.")
                router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
            } else if (state.message.includes("Error") || state.message.includes("Failed") || state.message.includes("use")) {
                toast.error(state.message)
            }
        }
    }, [state, router, formData.email])

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps))
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    // Validation Check for Next Button
    const isStepValid = () => {
        if (step === 1) return formData.name && formData.dateOfBirth && formData.nationalId && fileName
        if (step === 2) return formData.email && formData.phoneNumber && formData.address && formData.location
        if (step === 3) return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
        if (step === 4) return formData.terms
        return false
    }

    // Update local state
    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {['Personal', 'Contact', 'Security', 'Review'].map((label, idx) => (
                        <div key={label} className={`text-xs font-bold ${step > idx ? 'text-amber-500' : 'text-slate-600'} uppercase tracking-wider`}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-sm md:text-base text-slate-400 mb-4 md:mb-6">Step {step} of {totalSteps}</p>

            {/* Error Display */}
            {state.message && !state.message.includes("success") && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{state.message}</p>
                    {state.errors && Object.keys(state.errors).length > 0 && (
                        <ul className="mt-2 text-xs text-red-300 list-disc pl-4">
                            {Object.entries(state.errors).map(([field, errors]) => (
                                errors?.map((error, idx) => (
                                    <li key={`${field}-${idx}`}>{field}: {error}</li>
                                ))
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form action={formAction} className="space-y-6" onSubmit={(e) => {
                console.log("Form submitting...");
                const formData = new FormData(e.currentTarget);
                console.log("Form data entries:");
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
            }}>
                {/* Hidden inputs to ship all data at the end */}
                {/* We only render visible inputs per step, but we need all inputs present when submitting */}
                {/* Actually, standard form behavior: hidden inputs don't sync with the visible inputs automatically if they are separate components. */}
                {/* Strategy: Render ALL inputs always, but use CSS 'hidden' to toggle visibility. This ensures browser collects all data on submit. */}

                {/* Step 1: Personal Info */}
                <div className={step === 1 ? "step-visible" : "step-hidden"}>
                    <div className="space-y-4 bg-white/5 p-4 md:p-6 rounded-xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Full Name</label>
                                <input
                                    className={getInputClass("name")}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                                <FieldError errors={getError("name")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Date of Birth</label>
                                <input
                                    className={getInputClass("dateOfBirth")}
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                                <FieldError errors={getError("dateOfBirth")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">National ID</label>
                                <input
                                    className={getInputClass("nationalId")}
                                    name="nationalId"
                                    value={formData.nationalId}
                                    onChange={handleChange}
                                    placeholder="63-1234567-T-07"
                                    required
                                />
                                <FieldError errors={getError("nationalId")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Upload ID</label>
                                <div className="relative">
                                    <input type="file" id="idImage" name="idImage" accept="image/*,application/pdf" className="hidden"
                                        onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
                                    <label htmlFor="idImage" className={`flex h-11 w-full items-center justify-between rounded-lg border bg-slate-950 px-3 cursor-pointer hover:bg-slate-900 transition-colors ${getError("idImage") ? "border-red-500 bg-red-900/10" : "border-white/10"}`}>
                                        <span className={`truncate text-sm ${getError("idImage") ? "text-red-300" : "text-slate-400"}`}>{fileName || "Select File"}</span>
                                        <Upload className={`h-4 w-4 ${getError("idImage") ? "text-red-400" : "text-amber-500"}`} />
                                    </label>
                                    <FieldError errors={getError("idImage")} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Contact */}
                <div className={step === 2 ? "step-visible" : "step-hidden"}>
                    <div className="space-y-4 bg-white/5 p-4 md:p-6 rounded-xl border border-white/10">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Email</label>
                            <input
                                className={getInputClass("email")}
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("email")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Phone</label>
                            <input
                                className={getInputClass("phoneNumber")}
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("phoneNumber")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Address</label>
                            <input
                                className={getInputClass("address")}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("address")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">City/Location</label>
                            <input
                                className={getInputClass("location")}
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("location")} />
                        </div>
                    </div>
                </div>

                {/* Step 3: Security */}
                <div className={step === 3 ? "step-visible" : "step-hidden"}>
                    <div className="space-y-4 bg-white/5 p-4 md:p-6 rounded-xl border border-white/10">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Password</label>
                            <input
                                className={getInputClass("password")}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("password")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                            <input
                                className={getInputClass("confirmPassword")}
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <FieldError errors={getError("confirmPassword")} />
                        </div>
                        <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1 mt-2">
                            <li>Min. 8 characters</li>
                            <li>One uppercase & one lowercase</li>
                            <li>One number & one special character</li>
                        </ul>
                    </div>
                </div>

                {/* Step 4: Review */}
                <div className={step === 4 ? "step-visible" : "step-hidden"}>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold text-white">Summary</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="text-slate-400">Name:</dt><dd className="text-slate-200 text-right">{formData.name}</dd>
                            <dt className="text-slate-400">Email:</dt><dd className="text-slate-200 text-right">{formData.email}</dd>
                            <dt className="text-slate-400">Phone:</dt><dd className="text-slate-200 text-right">{formData.phoneNumber}</dd>
                        </dl>

                        <div className="pt-4 border-t border-white/10">
                            <div className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${getError("terms") ? "bg-red-900/10 border-red-500" : "bg-amber-500/10 border-amber-500/20"}`}>
                                <input
                                    type="checkbox" id="terms" name="terms"
                                    checked={formData.terms}
                                    className={`h-5 w-5 rounded bg-slate-800 text-amber-500 focus:ring-amber-500 ${getError("terms") ? "border-red-500" : "border-slate-600"}`}
                                    // Make read-only here, controlled by modal
                                    readOnly
                                    onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                                />
                                <label htmlFor="terms" className={`text-sm cursor-pointer select-none ${getError("terms") ? "text-red-300" : "text-slate-300"}`} onClick={() => setShowTerms(true)}>
                                    I agree to the <span className="text-amber-500 underline font-medium">Terms & Conditions</span>
                                </label>
                            </div>
                            <FieldError errors={getError("terms")} />
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button type="button" onClick={handleBack} className="btn-secondary">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <button type="button" onClick={handleNext} disabled={!isStepValid()} className="btn-primary">
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </button>
                    ) : (
                        <SubmitButton disabled={!formData.terms} />
                    )}
                </div>
            </form>

            <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                onAccept={() => {
                    setFormData(prev => ({ ...prev, terms: true }));
                    setShowTerms(false);
                }}
            />

            {/* Styles */}
            <style jsx global>{`
                .step-visible {
                    display: block;
                    opacity: 1;
                    visibility: visible;
                    max-height: none;
                    animation: fadeIn 0.3s ease-in;
                }
                .step-hidden {
                    visibility: hidden;
                    max-height: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .input-field {
                    display: flex; height: 2.75rem; width: 100%; border-radius: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.1); background-color: rgb(2 6 23);
                    padding: 0.5rem 0.75rem; font-size: 0.875rem; color: white;
                }
                .input-field:focus { outline: none; border-color: rgba(245,158,11,0.5); }
                .btn-primary {
                    display: inline-flex; align-items: center; justify-content: center;
                    border-radius: 0.5rem; font-weight: 700; height: 3rem; padding: 0 1.5rem;
                    background-color: #f59e0b; color: #0f172a; transition: all;
                    opacity: 1;
                }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary {
                    display: inline-flex; align-items: center; justify-content: center;
                    border-radius: 0.5rem; font-weight: 600; height: 3rem; padding: 0 1.5rem;
                    background-color: transparent; border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; transition: all;
                }
                .btn-secondary:hover { color: white; border-color: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus()
    return (
        <button type="submit" disabled={disabled || pending} className="btn-primary">
            {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
            Create Account
        </button>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
            <RegisterWizard />
        </Suspense>
    )
}
