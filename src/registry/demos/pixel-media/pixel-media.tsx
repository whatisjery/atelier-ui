import { type PixelEffectProps, PixelMedia } from "@/registry/base/pixel-media/pixel-media"

// The controls only tweak the shared pixel knobs; `type` picks the media.
type PixelMediaControls = Partial<PixelEffectProps> & { type?: "image" | "video" }

export default function PixelMediaDemo({ type = "image", ...controls }: PixelMediaControls) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center font-serif xs:text-5xl text-center text-4xl text-white z-3 pointer-events-none">
                Hover anywhere!
            </div>
            {type === "video" ? (
                <PixelMedia
                    type="video"
                    src="/video/demo/shared/1.mp4"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            ) : (
                <PixelMedia
                    type="image"
                    alt="my image"
                    src="/images/demo/shared/19.webp"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            )}
        </div>
    )
}
