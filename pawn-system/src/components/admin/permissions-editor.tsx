"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserAccess } from "@/app/actions/admin/users"
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions"
import { useAI } from "@/components/ai/ai-provider"
import { Loader2, ShieldCheck, UserCog } from "lucide-react"
import { UserRole } from "@prisma/client"

interface PermissionsEditorProps {
    userId: string
    initialPermissions: string[]
    initialRole: UserRole
}

const TEMPLATES: Record<string, { role: UserRole, permissions: string[] }> = {
    CUSTOMER: {
        role: "CUSTOMER",
        permissions: []
    },
    EMPLOYEE: {
        role: "STAFF",
        permissions: [
            PERMISSIONS.DASHBOARD_ACCESS,
            PERMISSIONS.LOANS_READ,
            PERMISSIONS.LOANS_WRITE,
            PERMISSIONS.CUSTOMERS_READ,
            PERMISSIONS.CUSTOMERS_WRITE,
            PERMISSIONS.AUCTIONS_READ,
            PERMISSIONS.AUCTIONS_WRITE,
            PERMISSIONS.PAYMENTS_READ,
            PERMISSIONS.PAYMENTS_WRITE,
            PERMISSIONS.VALUATIONS_READ,
            PERMISSIONS.VALUATIONS_WRITE
        ]
    },
    ADMIN: {
        role: "ADMIN",
        permissions: Object.keys(PERMISSIONS)
    }
}

export function PermissionsEditor({ userId, initialPermissions, initialRole }: PermissionsEditorProps) {
    const [permissions, setPermissions] = useState<string[]>(initialPermissions)
    const [role, setRole] = useState<UserRole>(initialRole)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { notify } = useAI()

    const handleToggle = (permission: string) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        )
    }

    const applyTemplate = (templateName: string) => {
        const template = TEMPLATES[templateName]
        if (template) {
            setRole(template.role)
            setPermissions(template.permissions)
            notify(`Applied ${templateName} template`, `Role set to ${template.role}`, undefined, "default")
        }
    }

    const handleSelectAll = () => {
        setPermissions(Object.keys(PERMISSIONS))
    }

    const handleClearAll = () => {
        setPermissions([])
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateUserAccess(userId, role, permissions)
            notify("Access updated successfully", `Role: ${role}, Permissions: ${permissions.length}`, undefined, "success")
            router.refresh()
        } catch (error) {
            notify("Failed to update access", undefined, undefined, "error")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Template Selector Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-primary" />
                        Quick Access Templates
                    </CardTitle>
                    <CardDescription>
                        Select a predefined role to automatically configure permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-[200px] space-y-2">
                            <label className="text-sm font-medium">Select Template</label>
                            <Select onValueChange={applyTemplate}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                    <SelectItem value="EMPLOYEE">Employee (Staff)</SelectItem>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground pb-2">
                            Current Role: <span className="font-semibold text-foreground">{role}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Granular Permissions Card */}
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Granular Permissions
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>Select All</Button>
                        <Button variant="outline" size="sm" onClick={handleClearAll}>Clear</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(PERMISSIONS).map(([osmKey, key]) => (
                            <div key={key} className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={key}
                                    checked={permissions.includes(key)}
                                    onCheckedChange={() => handleToggle(key)}
                                />
                                <label
                                    htmlFor={key}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                >
                                    {PERMISSION_LABELS[key]}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border">
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Access Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
