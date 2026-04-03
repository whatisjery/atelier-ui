"use client"

import { useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Docr3fDemoLoader from "@/components/features/docs/Docr3fDemoLoader"
import GridPattern from "@/components/ui/GridPattern"
import { LiquidTouchMaterial } from "@/registry/base/liquid-touch/liquid-touch"

function LiquidTouchImage({ src }: { src: string }) {
    const texture = useTexture(src)

    return (
        <mesh>
            <planeGeometry args={[4.5, 4.5]} />
            <LiquidTouchMaterial map={texture} />
        </mesh>
    )
}

export default function LiquidTouchDemo() {
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
                    <LiquidTouchImage src="/images/demo/shared/3.webp" />
                </Canvas>
            </Suspense>
        </>
    )
}
