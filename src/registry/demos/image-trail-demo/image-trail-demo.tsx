"use client"

import Image from "next/image"
import { type ComponentRef, useRef } from "react"
import GridPattern from "@/components/ui/GridPattern"
import { ImageTrail } from "@/registry/base/image-trail/Image-trail"

const ITEMS = [
    "/images/demo/image-trail/1.webp",
    "/images/demo/image-trail/2.webp",
    "/images/demo/image-trail/3.webp",
    "/images/demo/image-trail/4.webp",
]

export default function ImageTrailDemo() {
    const ref = useRef<ComponentRef<"div">>(null)

    return (
        <div
            ref={ref}
            className="bg-background w-full h-full absolute inset-0 not-prose flex items-center justify-center overflow-hidden"
        >
            <GridPattern hoverEffect={false} gridSize={28} />

            <div className="font-serif xs:text-5xl relative z-1 text-center text-4xl">
                Drag your mouse around.
            </div>

            <ImageTrail
                containerRef={ref}
                data={ITEMS}
                renderItems={(src) => (
                    <div className="w-28 h-28 flex items-center justify-center relative rounded-lg overflow-hidden">
                        <Image src={src} alt="Image" fill objectFit="cover" />
                    </div>
                )}
            />
        </div>
    )
}
