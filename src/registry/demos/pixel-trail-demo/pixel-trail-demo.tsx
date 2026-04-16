"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { PixelTrail, type PixelTrailProps } from "@/registry/base/pixel-trail/pixel-trail"

export default function PixelTrailDemo(controls: Partial<PixelTrailProps>) {
    const { resolvedTheme } = useTheme()

    return (
        <div className="w-full h-full absolute inset-0 not-prose flex items-center justify-center">
            <div className="w-60 h-60 relative">
                <Image
                    src="/images/demo/pixel-trail/cloud.webp"
                    alt="Pixel Trail Demo"
                    className="object-cover"
                    sizes="10vw"
                    fill
                />
            </div>

            <PixelTrail
                mode="sample"
                imageSelector="img"
                lightenSample={20}
                className="pointer-events-none top-0"
                color={resolvedTheme === "dark" ? "#FFFFFF" : "#000000"}
                pixelSize={20}
                trailRadius={2}
                fade={0}
                lifetime={1}
                {...controls}
            />
        </div>
    )
}
