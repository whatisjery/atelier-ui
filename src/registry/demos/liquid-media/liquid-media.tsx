import { Canvas } from "@react-three/fiber"
import { type LiquidEffectProps, LiquidMedia } from "@/registry/base/liquid-media/liquid-media"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

// The controls only tweak the shared ripple knobs; `type` picks the media.
type LiquidMediaControls = Partial<LiquidEffectProps> & { type?: "image" | "video" }

export default function LiquidMediaDemo({ type = "image", ...controls }: LiquidMediaControls) {
    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="w-full h-screen flex items-center justify-center px-2">
                {type === "video" ? (
                    <LiquidMedia
                        type="video"
                        src="/video/demo/shared/1.mp4"
                        className="w-2xl h-auto"
                        {...controls}
                    />
                ) : (
                    <LiquidMedia
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
