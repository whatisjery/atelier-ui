import { useTheme } from "next-themes"
import { PixelTrail, type PixelTrailProps } from "@/registry/base/pixel-trail/pixel-trail"

const IMAGE_URLS = [
    "/images/demo/shared/4.webp",
    "/images/demo/shared/12.webp",
    "/images/demo/shared/15.webp",
]

export default function PixelTrailDemo(controls: Partial<PixelTrailProps>) {
    const { resolvedTheme } = useTheme()

    return (
        <div className="flex h-screen w-full justify-center items-center">
            <div className="absolute inset-0 flex items-center justify-center font-serif xs:text-5xl text-center text-4xl z-3 pointer-events-none text-white">
                Hover anywhere!
            </div>
            <div className="flex w-full flex-1 items-center justify-center gap-2">
                {IMAGE_URLS.map((url) => (
                    <img
                        key={url}
                        src={url}
                        alt="Image"
                        width={100}
                        height={100}
                        draggable={false}
                        className="aspect-[5/7] w-[30vw] rounded-md object-cover select-none"
                    />
                ))}
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
