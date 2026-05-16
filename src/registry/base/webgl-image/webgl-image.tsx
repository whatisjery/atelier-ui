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
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type Pointer = {
    uv: Vector2
    hover: number
}

type WebglImageProps = {
    src: string
    alt: string
    segments?: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    webglEnabled?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src" | "alt">

type PlaneProps = {
    el: RefObject<HTMLImageElement | null>
    src: string
    segments: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    pointer: Pointer
}

function Plane({ el, src, segments, material, pointer }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const texture = useTexture(src)
    const size = useThree((s) => s.size)
    const viewport = useThree((s) => s.viewport)
    const fitScale = useRef({ x: 1, y: 1 })
    const bounds = useRef({ x: 0, y: 0, width: 0, height: 0 })

    useLayoutEffect(() => {
        const target = el.current
        if (!target) return

        const measure = () => {
            const m = mesh.current
            if (!m) return

            // Rect in document coords (top/left offset by current scroll at measure time),
            // so we can later derive viewport position with just `window.scrollX/Y`,
            // instead of recalculating bounds on every render
            const rect = target.getBoundingClientRect()
            bounds.current.x = rect.left + window.scrollX
            bounds.current.y = rect.top + window.scrollY
            bounds.current.width = rect.width
            bounds.current.height = rect.height

            // Replicate CSS object-fit: cover crops via UV repeat/offset; contain shrinks the mesh scale
            // because UVs alone can't letterbox: the plane would still fill the element.
            const image = texture.image as HTMLImageElement
            const objectFit = getComputedStyle(target).objectFit
            const planeAspect = rect.width / rect.height
            const imageAspect = image.width / image.height

            let repeatU = 1
            let repeatV = 1

            fitScale.current.x = 1
            fitScale.current.y = 1

            if (objectFit === "cover") {
                if (planeAspect > imageAspect) {
                    repeatV = imageAspect / planeAspect
                } else {
                    repeatU = planeAspect / imageAspect
                }
            } else if (objectFit === "contain") {
                if (planeAspect > imageAspect) {
                    fitScale.current.x = imageAspect / planeAspect
                } else {
                    fitScale.current.y = planeAspect / imageAspect
                }
            }

            const offsetU = (1 - repeatU) / 2
            const offsetV = (1 - repeatV) / 2

            const uvAttribute = m.geometry.attributes.uv

            for (let iy = 0; iy <= segments; iy++) {
                for (let ix = 0; ix <= segments; ix++) {
                    const idx = iy * (segments + 1) + ix
                    const u = ix / segments
                    const v = 1 - iy / segments
                    uvAttribute.setXY(idx, u * repeatU + offsetU, v * repeatV + offsetV)
                }
            }

            uvAttribute.needsUpdate = true
        }

        measure()

        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)
        return () => ro.disconnect()
    }, [el, texture, segments])

    useFrame(() => {
        const m = mesh.current
        if (!m) return
        const { x, y, width, height } = bounds.current
        const pxToWorld = viewport.height / size.height

        m.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
        m.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
        m.scale.x = width * pxToWorld * fitScale.current.x
        m.scale.y = height * pxToWorld * fitScale.current.y
    })

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[1, 1, segments, segments]} />
            {material ? (
                material(texture, pointer)
            ) : (
                <meshBasicMaterial map={texture} transparent />
            )}
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
    const pointer = useMemo<Pointer>(() => {
        return {
            uv: new Vector2(0.5, 0.5),
            hover: 0,
        }
    }, [])

    useEffect(() => {
        if (!webglEnabled) return
        const target = el.current
        if (!target) return

        // Track the pointer on the dom element directly and passed to the material
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
