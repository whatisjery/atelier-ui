import { useTexture } from "@react-three/drei"
import { type ComponentRef, type RefObject, useLayoutEffect, useRef } from "react"
import type { Mesh, Texture } from "three"
import { useDomPlane } from "../../hooks/use-dom-plane"
import { type Pointer, usePointerUv } from "../../hooks/use-pointer-uv"
import { applyUvCrop, computeObjectFit } from "../../lib/object-fit"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type { Pointer }

type WebglImageProps = {
    src: string
    alt: string
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    webglEnabled?: boolean
    segments?: number
    zIndex?: number
    /**
     * Re-measures the DOM rect every frame so the plane follows animated parents (motion, parallax).
     * Costs one layout read per frame, so only enable it when needed.
     */
    autoReflow?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src" | "alt">

type PlaneProps = {
    el: RefObject<HTMLImageElement | null>
    src: string
    segments: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    pointer: Pointer
    uvFit: RefObject<{ x: number; y: number }>
    zIndex: number
    autoReflow: boolean
}

function Plane({ el, src, segments, material, pointer, uvFit, zIndex, autoReflow }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const texture = useTexture(src)
    const fitScale = useRef({ x: 1, y: 1 })
    const measureBounds = useDomPlane(el, mesh, { autoReflow, fitScale })

    useLayoutEffect(() => {
        const target = el.current
        if (!target) return

        const measure = () => {
            const m = mesh.current
            if (!m) return
            const rect = measureBounds()
            if (!rect) return

            const image = texture.image as HTMLImageElement
            const crop = computeObjectFit(
                rect.width / rect.height,
                image.width / image.height,
                getComputedStyle(target).objectFit,
            )

            fitScale.current.x = crop.fitScaleX
            fitScale.current.y = crop.fitScaleY
            pointer.repeat.set(crop.repeatU, crop.repeatV)
            uvFit.current.x = crop.repeatU / crop.fitScaleX
            uvFit.current.y = crop.repeatV / crop.fitScaleY

            applyUvCrop(m.geometry.attributes.uv, segments, crop.repeatU, crop.repeatV)
        }

        measure()

        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)
        return () => ro.disconnect()
    }, [el, texture, segments, uvFit, pointer, measureBounds])

    return (
        <mesh ref={mesh} renderOrder={zIndex}>
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
    zIndex = 0,
    autoReflow = false,
    ...rest
}: WebglImageProps) {
    const el = useRef<ComponentRef<"img">>(null)
    const uvFit = useRef({ x: 1, y: 1 })
    const pointer = usePointerUv(el, { enabled: webglEnabled, uvFit })

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
                        uvFit={uvFit}
                        zIndex={zIndex}
                        autoReflow={autoReflow}
                    />
                </webglTeleport.In>
            )}
        </>
    )
}
