import { addEffect, Canvas } from "@react-three/fiber"
import { type LenisRef, ReactLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { CurveImage, type CurveImageProps } from "@/registry/base/curve-image/curve-image"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

export default function CurveImageDemo(controls: Partial<CurveImageProps>) {
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        return addEffect((time) => {
            lenisRef.current?.lenis?.raf(time)
        })
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: true }}>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="h-screen flex items-center justify-center font-serif text-5xl">
                Scroll down
            </div>

            <div className="flex flex-col p-10 gap-y-5">
                <CurveImage
                    alt="my image"
                    src="/images/demo/shared/2.webp"
                    className="w-full h-auto object-cover rounded-md"
                    {...controls}
                />
            </div>

            <div className="h-screen flex items-center justify-center font-serif text-5xl">
                Scroll up
            </div>
        </ReactLenis>
    )
}
