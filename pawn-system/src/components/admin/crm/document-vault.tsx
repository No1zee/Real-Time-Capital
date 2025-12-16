"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileIcon, Upload, Eye, CheckCircle, XCircle } from "lucide-react"

interface UserDocument {
    id: string
    title: string
    type: string
    status: string
    uploadedAt: Date
    url: string
}

interface DocumentVaultProps {
    documents: UserDocument[] // We'll mock this for now or fetch via props if added to action
}

export function DocumentVault({ documents }: DocumentVaultProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">KYC & Contracts</h3>
                <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Fallback Empty State */}
                {documents.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                        <FileIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents uploaded yet.</p>
                    </div>
                )}

                {documents.map(doc => (
                    <Card key={doc.id} className="overflow-hidden group">
                        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                            <FileIcon className="w-10 h-10 text-slate-400" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="absolute top-2 right-2">
                                <Badge variant={doc.status === "VERIFIED" ? "default" : "secondary"}>
                                    {doc.status}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-3">
                            <p className="font-medium text-sm truncate" title={doc.title}>{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
