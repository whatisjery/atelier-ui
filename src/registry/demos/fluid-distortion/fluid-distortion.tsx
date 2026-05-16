import { Environment } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { Suspense, useRef } from "react"
import { suspend } from "suspend-react"
import type { Mesh } from "three"
import Docr3fDemoLoader from "@/components/features/docs/Docr3fDemoLoader"
import {
    FluidDistortion,
    type FluidDistortionProps,
} from "@/registry/base/fluid-distortion/fluid-distortion"

const warehouse = import("@pmndrs/assets/hdri/warehouse.exr").then((m) => m.default)

function RotatingCube() {
    const ref = useRef<Mesh>(null)
    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.x += 0.005
            ref.current.rotation.y += 0.005
        }
    })

    return (
        <mesh scale={2} ref={ref}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial
                transparent={true}
                metalness={0.1}
                roughness={0}
                color="#727881"
            />
        </mesh>
    )
}

export default function FluidCursorDemo(controls: Partial<FluidDistortionProps>) {
    return (
        <Suspense fallback={<Docr3fDemoLoader />}>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <Environment files={suspend(warehouse) as string} />
                <RotatingCube />
                <EffectComposer>
                    <FluidDistortion {...controls} />
                </EffectComposer>
            </Canvas>
        </Suspense>
    )
}
