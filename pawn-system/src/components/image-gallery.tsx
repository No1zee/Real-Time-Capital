"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ImageGalleryProps {
    images: string[]
    title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Fallback if no images
    const displayImages = images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"]

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900 group cursor-zoom-in">
                        <img
                            src={displayImages[selectedIndex]}
                            alt={`${title} - Image ${selectedIndex + 1}`}
                            className="h-full w-full object-contain transition-transform duration-300"
                        />

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {displayImages.length > 1 && (
                            <>
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2"
                                    onClick={(e) => e.stopPropagation()} // Prevent dialog open on nav click
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={handlePrevious}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={handleNext}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </div>
                            </>
                        )}

                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {selectedIndex + 1} / {displayImages.length}
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden bg-black/95 border-0">
                    <DialogTitle className="sr-only">{title} - Full View</DialogTitle>
                    <DialogDescription className="sr-only">
                        Full screen view of {title}. Use arrow keys or buttons to navigate.
                    </DialogDescription>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={displayImages[selectedIndex]}
                            alt={`${title} - Full View`}
                            className="max-w-full max-h-full object-contain"
                        />
                        {/* Navigation in Modal */}
                        {displayImages.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handlePrevious()
                                    }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleNext()
                                    }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {displayImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                selectedIndex === index
                                    ? "border-amber-500 ring-2 ring-amber-500/20"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            )}
                        >
                            <img
                                src={img}
                                alt={`${title} - Thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
