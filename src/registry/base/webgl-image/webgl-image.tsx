import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import {
    type ComponentRef,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react"
import { type Mesh, type Texture, Vector2 } from "three"
import { webglTeleport } from "../webgl-rig/webgl-rig"

export type WebglImagePointer = {
    uv: Vector2
    hover: number
}

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
    material: (map: Texture, pointer: WebglImagePointer) => React.ReactNode
    webglEnabled?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src" | "alt">

type PlaneProps = {
    el: RefObject<HTMLImageElement | null>
    src: string
    segments: number
    material: (map: Texture, pointer: WebglImagePointer) => React.ReactNode
    pointer: WebglImagePointer
}

function Plane({ el, src, segments, material, pointer }: PlaneProps) {
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
            {material(map, pointer)}
        </mesh>
    )
}

export function WebglImage({
    src,
    alt,
    className,
    style,
    material,
    webglEnabled = true,
    segments = 1,
    ...rest
}: WebglImageProps) {
    const el = useRef<ComponentRef<"img">>(null)
    const pointer = useMemo<WebglImagePointer>(() => {
        return {
            uv: new Vector2(0.5, 0.5),
            hover: 0,
        }
    }, [])

    useEffect(() => {
        if (!webglEnabled) return
        const target = el.current
        if (!target) return

        const onMove = (e: PointerEvent) => {
            const { width, left, top, height } = target.getBoundingClientRect()
            const x = (e.clientX - left) / width
            const y = 1 - (e.clientY - top) / height
            pointer.uv.set(x, y)
        }

        const onEnter = () => (pointer.hover = 1)
        const onLeave = () => (pointer.hover = 0)

        target.addEventListener("pointermove", onMove)
        target.addEventListener("pointerenter", onEnter)
        target.addEventListener("pointerleave", onLeave)
        return () => {
            target.removeEventListener("pointermove", onMove)
            target.removeEventListener("pointerenter", onEnter)
            target.removeEventListener("pointerleave", onLeave)
        }
    }, [webglEnabled, pointer])

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
                    <Plane
                        el={el}
                        src={src}
                        segments={segments}
                        material={material}
                        pointer={pointer}
                    />
                </webglTeleport.In>
            )}
        </>
    )
}
