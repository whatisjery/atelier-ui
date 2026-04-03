"use client"

import Image from "next/image"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
    InfiniteGallery,
    type InfiniteGalleryMode,
} from "@/registry/base/infinite-gallery/infinite-gallery"

const ITEMS = [
    { src: "/images/demo/shared/1.webp", height: 200 },
    { src: "/images/demo/shared/2.webp", height: 280 },
    { src: "/images/demo/shared/3.webp", height: 200 },
    { src: "/images/demo/shared/4.webp", height: 250 },
]

const MODES: { value: InfiniteGalleryMode; label: string }[] = [
    {
        value: "shrink",
        label: "Mode shrink",
    },
    {
        value: "flip",
        label: "Mode flip",
    },
]

export default function InfiniteGalleryDemo() {
    const [selectedMode, setSelectedMode] = useState<InfiniteGalleryMode>("flip")

    const isMobile = useIsMobile()

    return (
        <>
            <div className="absolute top-3 right-3 text-xs flex space-x-5 z-2">
                {MODES.map((mode) => (
                    <button
                        aria-label={mode.label}
                        className="cursor-pointer flex items-center gap-1 bg-transparent"
                        key={mode.value}
                        onClick={() => setSelectedMode(mode.value)}
                        type="button"
                    >
                        <div
                            className={cn(
                                "w-2 h-2 border border-mat-1 bg-background rounded-full",
                                { "bg-mat-1": selectedMode === mode.value },
                            )}
                        />

                        <span
                            className={cn("opacity-50 uppercase font-mono", {
                                "opacity-100": selectedMode === mode.value,
                            })}
                        >
                            {mode.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="w-full h-full absolute flex justify-center">
                <InfiniteGallery
                    data={ITEMS}
                    className="w-full items-center"
                    mode={selectedMode}
                    gap={10}
                    perView={isMobile ? 2 : ITEMS.length - 1}
                    renderItem={(item) => (
                        <Image
                            src={item.src}
                            alt="image"
                            width={600}
                            height={200}
                            style={{ height: selectedMode === "flip" ? item.height : "auto" }}
                            className="object-cover select-none pointer-events-none"
                            draggable={false}
                        />
                    )}
                />
            </div>
        </>
    )
}
