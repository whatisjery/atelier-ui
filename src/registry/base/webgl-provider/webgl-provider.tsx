"use client"

import { Canvas } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { type ReactNode, type RefObject, useRef } from "react"
import { effectTeleport, WebglPortal } from "../webgl-portal/webgl-portal"

type WebglProviderProps = {
    children: ReactNode
}

function Effects() {
    const effects = effectTeleport.useItems()
    if (effects.length === 0) return null

    return (
        <EffectComposer key={effects.length}>
            <effectTeleport.Out />
        </EffectComposer>
    )
}

export function WebglProvider({ children }: WebglProviderProps) {
    const eventSource = useRef<HTMLDivElement>(null)

    return (
        <div ref={eventSource} style={{ display: "contents" }}>
            <Canvas
                eventSource={eventSource as RefObject<HTMLElement>}
                eventPrefix="client"
                dpr={[1, 1.5]}
                style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
            >
                <WebglPortal />
                <Effects />
            </Canvas>

            {children}
        </div>
    )
}
