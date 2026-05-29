import { Canvas } from "@react-three/fiber"
import { PixelImage, type PixelImageProps } from "@/registry/base/pixel-image/pixel-image"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

export default function PixelImageDemo(controls: Partial<PixelImageProps>) {
    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="w-full h-screen flex items-center justify-center p-5">
                <PixelImage
                    alt="my image"
                    src="/images/demo/shared/3.webp"
                    className="w-xs h-auto"
                    {...controls}
                />
            </div>
        </>
    )
}
