"use client"

import { advance, Canvas, type CanvasProps, useStore, useThree } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { cancelFrame, type FrameData, frame } from "motion"
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

// Renders in Motion's `postRender` phase, after Lenis and Motion have
// updated. One shared driver serves every mounted provider.
type CanvasStore = ReturnType<typeof useStore>
const canvasStores = new Set<CanvasStore>()
let clockStart: number | null = null

function tick(data: FrameData) {
    if (clockStart === null) clockStart = data.timestamp

    // frameloop="never" expects the elapsed clock time in seconds.
    const elapsed = (data.timestamp - clockStart) / 1000

    let runGlobalEffects = true
    for (const store of canvasStores) {
        const state = store.getState()
        if (state.internal.active) {
            advance(elapsed, runGlobalEffects, state)
            runGlobalEffects = false
        }
    }
}

function MotionFrameloop() {
    const store = useStore()

    useEffect(() => {
        canvasStores.add(store)
        if (canvasStores.size === 1) frame.postRender(tick, true)
        return () => {
            canvasStores.delete(store)
            if (canvasStores.size === 0) cancelFrame(tick)
        }
    }, [store])

    return null
}

function Effects() {
    const effects = effectTeleport.useItems()
    const gl = useThree((state) => state.gl)
    const mounted = effects.length > 0

    // EffectComposer sets `renderer.autoClear = false` and never restores it;
    // without this the canvas keeps its last frame once the composer unmounts.
    useEffect(() => {
        if (!mounted) return
        return () => {
            gl.autoClear = true
        }
    }, [mounted, gl])

    if (!mounted) return null

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
                frameloop="never"
                eventSource={eventSource ?? undefined}
                style={{
                    position: contained ? "absolute" : "fixed",
                    inset: 0,
                    pointerEvents: "none",
                    ...style,
                }}
            >
                <MotionFrameloop />
                <WebglPortal />
                <Effects />
            </Canvas>

            {children}
        </div>
    )
}
