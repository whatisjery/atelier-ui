import { useTheme } from "next-themes"
import { PixelTrail, type PixelTrailProps } from "@/registry/base/pixel-trail/pixel-trail"

export default function PixelTrailDemo(controls: Partial<PixelTrailProps>) {
    const { resolvedTheme } = useTheme()

    return (
        <div className="flex h-screen w-full justify-center items-center">
            <div className="absolute items-center px-5 h-full top-0 w-full z-20 pointer-events-none flex justify-between">
                <span>2D canvas pixel trail &rarr; </span>
                <span>&rarr; move your mouse.</span>
            </div>

            <img
                src="/images/demo/shared/2.webp"
                alt="Image"
                width={100}
                height={100}
                draggable={false}
                className="aspect-[5/7] w-[35vw] object-cover select-none"
            />

            <PixelTrail
                mode="sample"
                imageSelector="img"
                className="absolute inset-0 w-full h-full"
                lightenSample={20}
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
