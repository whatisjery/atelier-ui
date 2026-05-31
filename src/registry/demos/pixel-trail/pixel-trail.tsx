import { useTheme } from "next-themes"
import { PixelTrail, type PixelTrailProps } from "@/registry/base/pixel-trail/pixel-trail"

export default function PixelTrailDemo(controls: Partial<PixelTrailProps>) {
    const { resolvedTheme } = useTheme()

    return (
        <div className="w-full h-screen flex items-center justify-center px-2">
            <img
                src="/images/demo/shared/1.webp"
                alt="Pixel Trail Demo"
                className="w-sm h-auto"
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
        </div>
    )
}
