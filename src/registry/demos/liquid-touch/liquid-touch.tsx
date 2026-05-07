import { useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Docr3fDemoLoader from "@/components/features/docs/Docr3fDemoLoader"
import {
    LiquidTouchMaterial,
    type LiquidTouchMaterialProps,
} from "@/registry/base/liquid-touch/liquid-touch"

function LiquidTouchImage({
    controls,
    src,
}: {
    controls: Partial<LiquidTouchMaterialProps>
    src: string
}) {
    const texture = useTexture(src)

    return (
        <mesh>
            <planeGeometry args={[4.5, 4.5]} />
            <LiquidTouchMaterial map={texture} {...controls} />
        </mesh>
    )
}

export default function LiquidTouchDemo(controls: Partial<LiquidTouchMaterialProps>) {
    return (
        <Suspense fallback={<Docr3fDemoLoader />}>
            <Canvas
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            >
                <LiquidTouchImage controls={controls} src="/images/demo/shared/3.webp" />
            </Canvas>
        </Suspense>
    )
}
