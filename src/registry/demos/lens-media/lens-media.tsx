import { Canvas } from "@react-three/fiber"
import { type LensEffectProps, LensMedia } from "@/registry/base/lens-media/lens-media"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

// The controls only tweak the shared lens knobs; `type` picks the media.
type LensMediaControls = Partial<LensEffectProps> & { type?: "image" | "video" }

export default function LensMediaDemo({ type = "image", ...controls }: LensMediaControls) {
    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="w-full h-screen flex items-center justify-center px-2">
                {type === "video" ? (
                    <LensMedia
                        type="video"
                        src="/video/demo/shared/1.mp4"
                        className="w-2xl h-auto"
                        {...controls}
                    />
                ) : (
                    <LensMedia
                        type="image"
                        alt="my image"
                        src="/images/demo/shared/1.webp"
                        className="w-sm h-auto"
                        {...controls}
                    />
                )}
            </div>
        </>
    )
}
