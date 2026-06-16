import { addEffect } from "@react-three/fiber"
import { type LenisRef, ReactLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { type CurveEffectProps, CurveMedia } from "@/registry/base/curve-media/curve-media"

// The controls only tweak the shared curve knobs; `type` picks the media.
type CurveMediaControls = Partial<CurveEffectProps> & { type?: "image" | "video" }

export default function CurveMediaDemo({ type = "image", ...controls }: CurveMediaControls) {
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        return addEffect((time) => {
            lenisRef.current?.lenis?.raf(time)
        })
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: true }}>
            <div className="h-screen flex items-center justify-center font-serif text-5xl">
                Scroll down
            </div>

            <div className="flex items-center justify-center p-5">
                {type === "video" ? (
                    <CurveMedia
                        type="video"
                        src="/video/demo/shared/1.mp4"
                        className="w-full h-auto object-cover rounded-md"
                        {...controls}
                    />
                ) : (
                    <CurveMedia
                        type="image"
                        alt="my image"
                        src="/images/demo/shared/1.webp"
                        className="w-xl h-auto object-cover rounded-md"
                        {...controls}
                    />
                )}
            </div>

            <div className="h-screen flex items-center justify-center font-serif text-5xl">
                Scroll up
            </div>
        </ReactLenis>
    )
}
