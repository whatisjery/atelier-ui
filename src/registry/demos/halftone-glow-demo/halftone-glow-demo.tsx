"use client"

import { Environment, MeshTransmissionMaterial } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useState } from "react"
import { suspend } from "suspend-react"
import type { Mesh, Texture } from "three"
import Docr3fDemoLoader from "@/components/features/docs/Docr3fDemoLoader"
import GridPattern from "@/components/ui/GridPattern"
import { HalftoneGlow } from "@/registry/base/halftone-glow/halftone-glow"

const warehouse = import("@pmndrs/assets/hdri/warehouse.exr").then((m) => m.default)

function RefractiveSphere({ buffer }: { buffer: Texture | null }) {
    const ref = useRef<Mesh>(null)

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 0.1
            ref.current.rotation.y += delta * 0.2
        }
    })

    return (
        <mesh ref={ref} scale={2}>
            <sphereGeometry args={[1, 10, 10]} />
            <MeshTransmissionMaterial
                buffer={buffer ?? undefined}
                transmission={0.94}
                ior={1.5}
                thickness={0.5}
                chromaticAberration={0.5}
                distortion={1}
                color="#E4EBFF"
                distortionScale={0.2}
            />
        </mesh>
    )
}

export default function HalftoneGlowDemo() {
    const [texture, setTexture] = useState<Texture | null>(null)

    return (
        <>
            <Docr3fDemoLoader />

            <div className="w-full h-full absolute -z-1 inset-0 bg-[#000000]" />
            <GridPattern strokeColor="#141515" hoverEffect={false} gridSize={28} />

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
                    <HalftoneGlow
                        edgeDistortion={0.02}
                        ringDistortion={0.1}
                        edgeSize={10}
                        edgeColor="#1d334e"
                        ringColor="#3981DA"
                        blurAmount={0.2}
                        speed={14}
                        onTextureReady={setTexture}
                    />
                    <Environment environmentIntensity={0.3} files={suspend(warehouse) as string} />
                    <RefractiveSphere buffer={texture} />
                </Canvas>
            </Suspense>
        </>
    )
}
