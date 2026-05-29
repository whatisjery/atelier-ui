import { Canvas } from "@react-three/fiber"
import { LensImage, type LensImageProps } from "@/registry/base/lens-image/lens-image"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

export default function LensImageDemo(controls: Partial<LensImageProps>) {
    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="w-full h-screen flex items-center justify-center p-5">
                <LensImage
                    alt="my image"
                    src="/images/demo/shared/3.webp"
                    className="w-xs h-auto"
                    {...controls}
                />
            </div>
        </>
    )
}
