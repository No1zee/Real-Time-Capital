"use client"

import { useState, useActionState } from "react"
import { Loader2, Save, Pencil } from "lucide-react"
import { updateCustomer, CustomerState } from "@/app/actions/customers"

interface EditCustomerFormProps {
    customer: {
        id: string
        firstName: string
        lastName: string
        nationalId: string
        phoneNumber: string
        email: string | null
        address: string | null
    }
}

const initialState: CustomerState = { message: null, errors: {} }

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [state, formAction, isPending] = useActionState(updateCustomer, initialState)

    if (!isEditing) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-primary hover:underline flex items-center"
                    >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Full Name</p>
                        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">National ID</p>
                        <p className="font-medium">{customer.nationalId}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{customer.phoneNumber}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email || "-"}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{customer.address || "-"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Edit Information</h3>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    Cancel
                </button>
            </div>

            <input type="hidden" name="id" value={customer.id} />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">First Name</label>
                    <input
                        name="firstName"
                        defaultValue={customer.firstName}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Last Name</label>
                    <input
                        name="lastName"
                        defaultValue={customer.lastName}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">National ID</label>
                    <input
                        name="nationalId"
                        defaultValue={customer.nationalId}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Phone Number</label>
                    <input
                        name="phoneNumber"
                        defaultValue={customer.phoneNumber}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <input
                        name="email"
                        defaultValue={customer.email || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium leading-none">Address</label>
                    <input
                        name="address"
                        defaultValue={customer.address || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
            </div>

            {state.message && (
                <div className={`p-3 rounded-md text-sm flex items-center ${state.message.includes("success") ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                    {state.message}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
