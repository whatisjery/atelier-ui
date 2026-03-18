"use client"

import { Environment } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { Suspense, useRef } from "react"
import type { Mesh } from "three"
import { FluidDistortion } from "@/registry/base/fluid-distortion/fluid-distortion"

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
        <Suspense fallback={null}>
            <div className="w-full h-full absolute inset-0 bg-transparent">
                <Canvas style={{ width: "100%", height: "100%" }}>
                    <Environment preset="studio" />
                    <RotatingCube />
                    <EffectComposer>
                        <FluidDistortion />
                    </EffectComposer>
                </Canvas>
            </div>
        </Suspense>
    )
}
