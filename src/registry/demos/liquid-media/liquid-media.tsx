import { type LiquidEffectProps, LiquidMedia } from "@/registry/base/liquid-media/liquid-media"

// The controls only tweak the shared ripple knobs; `type` picks the media.
type LiquidMediaControls = Partial<LiquidEffectProps> & { type?: "image" | "video" }

export default function LiquidMediaDemo({ type = "image", ...controls }: LiquidMediaControls) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="demo-text absolute inset-0 z-10 flex items-center justify-center pointer-events-none text-[#FFFFFF]">
                Hover anywhere!
            </div>
            {type === "video" ? (
                <LiquidMedia
                    type="video"
                    src="/video/demo/shared/1.mp4"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            ) : (
                <LiquidMedia
                    type="image"
                    alt="my image"
                    src="/images/demo/shared/21.webp"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            )}
        </div>
    )
}
