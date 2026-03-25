"use client"

import { Environment } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { Suspense, useRef } from "react"
import { suspend } from "suspend-react"
import type { Mesh } from "three"
import Docr3fDemoLoader from "@/components/features/docs/Docr3fDemoLoader"
import GridPattern from "@/components/ui/GridPattern"
import { FluidDistortion } from "@/registry/base/fluid-distortion/fluid-distortion"

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

export default function FluidCursorDemo() {
    return (
        <>
            <Docr3fDemoLoader />

            <GridPattern hoverEffect={false} gridSize={28} />

            <Suspense fallback={null}>
                <Canvas
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    <Environment files={suspend(warehouse) as string} />
                    <RotatingCube />
                    <EffectComposer>
                        <FluidDistortion />
                    </EffectComposer>
                </Canvas>
            </Suspense>
        </>
    )
}
