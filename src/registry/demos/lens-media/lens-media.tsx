import { type LensEffectProps, LensMedia } from "@/registry/base/lens-media/lens-media"

// The controls only tweak the shared lens knobs; `type` picks the media.
type LensMediaControls = Partial<LensEffectProps> & { type?: "image" | "video" }

export default function LensMediaDemo({ type = "image", ...controls }: LensMediaControls) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="demo-text absolute inset-0 z-10 flex items-center justify-center pointer-events-none text-[#FFFFFF]">
                Hover anywhere!
            </div>
            {type === "video" ? (
                <LensMedia
                    type="video"
                    src="/video/demo/shared/1.mp4"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            ) : (
                <LensMedia
                    type="image"
                    alt="my image"
                    src="/images/demo/shared/11.webp"
                    className="w-full h-full object-cover"
                    {...controls}
                />
            )}
        </div>
    )
}
