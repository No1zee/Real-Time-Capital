"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { updateUserPermissions } from "@/app/actions/admin/users"
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"

interface PermissionsEditorProps {
    userId: string
    initialPermissions: string[]
}

export function PermissionsEditor({ userId, initialPermissions }: PermissionsEditorProps) {
    const [permissions, setPermissions] = useState<string[]>(initialPermissions)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleToggle = (permission: string) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        )
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
            await updateUserPermissions(userId, permissions)
            toast.success("Permissions updated successfully")
            router.refresh()
        } catch (error) {
            toast.error("Failed to update permissions")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Permissions & Access Control
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
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
