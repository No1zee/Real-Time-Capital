"use client"

import { useState } from "react"
import { assignTag, createTag } from "@/app/actions/admin/crm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface CRMTag {
    id: string
    name: string
    color: string
}

interface TagManagerProps {
    userId: string
    initialTags: CRMTag[]
    availableTags: CRMTag[]
}

export function CRMTagManager({ userId, initialTags, availableTags }: TagManagerProps) {
    const [tags, setTags] = useState<CRMTag[]>(initialTags)
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = async (tag: CRMTag) => {
        if (tags.some(t => t.id === tag.id)) return

        // Optimistic
        setTags([...tags, tag])
        setIsOpen(false)

        await assignTag(userId, tag.id)
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">
                    {tag.name}
                </Badge>
            ))}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 rounded-full text-xs px-2 border-dashed">
                        <Plus className="w-3 h-3 mr-1" /> Tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px]" align="start">
                    <Command>
                        <CommandInput placeholder="Search or create..." />
                        <CommandList>
                            <CommandEmpty className="p-2">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => {/* create logic TBD */ }}>
                                    + Create New
                                </Button>
                            </CommandEmpty>
                            <CommandGroup heading="Available">
                                {availableTags.map(tag => (
                                    <CommandItem key={tag.id} onSelect={() => handleSelect(tag)}>
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
