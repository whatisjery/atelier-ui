import { type PixelEffectProps, PixelMedia } from "@/registry/base/pixel-media/pixel-media"

// The controls only tweak the shared pixel knobs; `type` picks the media.
type PixelMediaControls = Partial<PixelEffectProps> & { type?: "image" | "video" }

export default function PixelMediaDemo({ type = "image", ...controls }: PixelMediaControls) {
    return (
        <div className="w-full h-screen flex items-center justify-center px-3">
            {type === "video" ? (
                <PixelMedia
                    type="video"
                    src="/video/demo/shared/1.mp4"
                    className="w-2xl h-auto"
                    {...controls}
                />
            ) : (
                <PixelMedia
                    type="image"
                    alt="my image"
                    src="/images/demo/shared/1.webp"
                    className="w-sm h-auto"
                    {...controls}
                />
            )}
        </div>
    )
}
