"use client"

import { Canvas, type CanvasProps, useThree } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { type ComponentRef, type ReactNode, useEffect, useRef, useState } from "react"
import type { Camera, Scene } from "three"
import { effectTeleport, WebglPortal } from "../webgl-portal/webgl-portal"

type WebglProviderProps = Omit<CanvasProps, "children" | "eventSource"> & {
    children: ReactNode
    className?: string
    contained?: boolean
}

type WebglReadyOptions = {
    scene?: Scene
    camera?: Camera
    enabled?: boolean
    onReady?: () => void
}

export function useWebglReady({ scene, camera, enabled = true, onReady }: WebglReadyOptions = {}) {
    const [ready, setReady] = useState(false)
    const gl = useThree((state) => state.gl)
    const defaultScene = useThree((state) => state.scene)
    const defaultCamera = useThree((state) => state.camera)
    const onReadyRef = useRef(onReady)
    onReadyRef.current = onReady

    const targetScene = scene ?? defaultScene
    const targetCamera = camera ?? defaultCamera

    useEffect(() => {
        if (!enabled) return
        let active = true

        gl.compileAsync(targetScene, targetCamera).then(() => {
            if (!active) return
            requestAnimationFrame(() => {
                if (!active) return
                setReady(true)
                onReadyRef.current?.()
            })
        })

        return () => {
            active = false
        }
    }, [gl, targetScene, targetCamera, enabled])

    return ready
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

export function WebglProvider({
    children,
    className,
    style,
    contained = false,
    ...canvasProps
}: WebglProviderProps) {
    const [eventSource, setEventSource] = useState<ComponentRef<"div"> | null>(null)

    return (
        <div
            ref={setEventSource}
            className={className}
            style={contained ? { position: "relative" } : { display: "contents" }}
        >
            <Canvas
                eventPrefix="client"
                dpr={[1, 1.5]}
                {...canvasProps}
                eventSource={eventSource ?? undefined}
                style={{
                    position: contained ? "absolute" : "fixed",
                    inset: 0,
                    pointerEvents: "none",
                    ...style,
                }}
            >
                <WebglPortal />
                <Effects />
            </Canvas>

            {children}
        </div>
    )
}
