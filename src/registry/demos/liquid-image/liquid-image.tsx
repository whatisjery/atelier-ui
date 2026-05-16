import { Canvas } from "@react-three/fiber"
import { LiquidImage, type LiquidImageProps } from "@/registry/base/liquid-image/liquid-image"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

export default function LiquidImageDemo(controls: Partial<LiquidImageProps>) {
    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="w-full h-screen flex items-center justify-center p-5">
                <LiquidImage
                    alt="my image"
                    src="/images/demo/shared/3.webp"
                    className="w-xs h-auto"
                    {...controls}
                />
            </div>
        </>
    )
}
