"use client"

import Image from "next/image"
import { type ComponentRef, useRef } from "react"
import { ImageTrail, type PropsMouseTrail } from "@/registry/base/image-trail/image-trail"

const ITEMS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function ImageTrailDemo(controls: Partial<PropsMouseTrail<string>>) {
    const ref = useRef<ComponentRef<"div">>(null)

    return (
        <div
            ref={ref}
            className="w-full h-full absolute inset-0 not-prose flex items-center justify-center overflow-hidden"
        >
            <div className="font-serif xs:text-5xl relative z-1 text-center text-4xl">
                Drag your mouse around.
            </div>

            <ImageTrail
                containerRef={ref}
                data={ITEMS}
                renderItems={(src) => (
                    <div className="w-28 h-28 flex items-center justify-center relative rounded-lg overflow-hidden">
                        <Image src={src} alt="Image" fill sizes="10vw" className="object-cover" />
                    </div>
                )}
                {...controls}
            />
        </div>
    )
}
