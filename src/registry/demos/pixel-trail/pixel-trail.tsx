import Image from "next/image"
import { useTheme } from "next-themes"
import { PixelTrail, type PixelTrailProps } from "@/registry/base/pixel-trail/pixel-trail"

export default function PixelTrailDemo(controls: Partial<PixelTrailProps>) {
    const { resolvedTheme } = useTheme()

    return (
        <>
            <Image
                src="/images/demo/shared/1.webp"
                alt="Pixel Trail Demo"
                className="object-cover size-80 max-w-[80%] max-h-[80%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                width={100}
                height={100}
            />

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
        </>
    )
}
