import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { type ComponentRef, type RefObject, useLayoutEffect, useRef } from "react"
import type { Mesh, Texture } from "three"
import { webglTeleport } from "../webgl-rig/webgl-rig"

type Bounds = {
    x: number
    y: number
    width: number
    height: number
}

type WebglImageProps = {
    src: string
    alt: string
    segments?: number
    children?: (map: Texture) => React.ReactNode
    webglEnabled?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src" | "alt">

type PlaneProps = {
    el: RefObject<HTMLImageElement | null>
    src: string
    segments: number
    children?: (map: Texture) => React.ReactNode
}

function Plane({ el, src, segments, children }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const map = useTexture(src)
    const size = useThree((s) => s.size)

    // Rect in document coords (top/left offset by current scroll at measure time),
    // so we can later derive viewport position with just `window.scrollX/Y`,
    // instead of recalculating bounds on every render
    const bounds = useRef<Bounds>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    useLayoutEffect(() => {
        const target = el.current
        if (!target) return

        const measure = () => {
            const r = target.getBoundingClientRect()
            bounds.current.x = r.left + window.scrollX
            bounds.current.y = r.top + window.scrollY
            bounds.current.width = r.width
            bounds.current.height = r.height
        }

        measure()

        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)
        return () => ro.disconnect()
    }, [el])

    useFrame(() => {
        const m = mesh.current
        if (!m) return
        const b = bounds.current
        m.position.x = b.x + b.width / 2 - window.scrollX - size.width / 2
        m.position.y = -(b.y + b.height / 2 - window.scrollY - size.height / 2)
        m.scale.x = b.width
        m.scale.y = b.height
    })

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[1, 1, segments, segments]} />
            {children ? children(map) : <meshBasicMaterial map={map} />}
        </mesh>
    )
}

export function WebglImage({
    src,
    alt,
    className,
    style,
    children,
    webglEnabled = true,
    segments = 1,
    ...rest
}: WebglImageProps) {
    const el = useRef<ComponentRef<"img">>(null)

    return (
        <>
            <img
                ref={el}
                src={src}
                alt={alt}
                className={className}
                style={webglEnabled ? { ...style, opacity: 0 } : style}
                {...rest}
            />

            {webglEnabled && (
                <webglTeleport.In>
                    <Plane el={el} src={src} segments={segments}>
                        {children}
                    </Plane>
                </webglTeleport.In>
            )}
        </>
    )
}
