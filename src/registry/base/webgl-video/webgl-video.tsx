import { useFrame } from "@react-three/fiber"
import { type ComponentRef, type RefObject, useLayoutEffect, useRef, useState } from "react"
import { type Mesh, SRGBColorSpace, type Texture, VideoTexture } from "three"
import { useDomPlane } from "../../hooks/use-dom-plane"
import { type Pointer, usePointerUv } from "../../hooks/use-pointer-uv"
import { applyUvCrop, computeObjectFit } from "../../lib/object-fit"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type { Pointer }

type WebglVideoProps = {
    src: string
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    webglEnabled?: boolean
    segments?: number
    zIndex?: number
    /**
     * Re-measures the DOM rect every frame so the plane follows animated parents (motion, parallax).
     * Costs one layout read per frame, so only enable it when needed.
     */
    autoReflow?: boolean
} & Omit<React.ComponentPropsWithoutRef<"video">, "children" | "src">

type PlaneProps = {
    el: RefObject<HTMLVideoElement | null>
    segments: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    pointer: Pointer
    uvFit: RefObject<{ x: number; y: number }>
    zIndex: number
    autoReflow: boolean
}

function Plane({ el, segments, material, pointer, uvFit, zIndex, autoReflow }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const [texture, setTexture] = useState<VideoTexture | null>(null)
    const fitScale = useRef({ x: 1, y: 1 })
    const measureBounds = useDomPlane(el, mesh, { autoReflow, fitScale })

    useLayoutEffect(() => {
        const video = el.current
        if (!video) return

        /*
         * Build the texture from the DOM <video> itself so a single element
         * decodes once. VideoTexture pulls each new frame from it.
         */
        const videoTexture = new VideoTexture(video)
        videoTexture.colorSpace = SRGBColorSpace
        setTexture(videoTexture)
        return () => videoTexture.dispose()
    }, [el])

    useLayoutEffect(() => {
        const target = el.current
        if (!target || !texture) return

        const measure = () => {
            const m = mesh.current
            if (!m) return
            const rect = measureBounds()
            if (!rect) return

            /*
             * videoWidth/Height are 0 until metadata loads, which yields an
             * invalid aspect, so computeObjectFit skips cropping until then.
             */
            const video = texture.image as HTMLVideoElement
            const crop = computeObjectFit(
                rect.width / rect.height,
                video.videoWidth / video.videoHeight,
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

        /* Re-measure once the video reports its intrinsic size. */
        target.addEventListener("loadedmetadata", measure)
        target.addEventListener("resize", measure)

        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)
        return () => {
            ro.disconnect()
            target.removeEventListener("loadedmetadata", measure)
            target.removeEventListener("resize", measure)
        }
    }, [el, texture, segments, uvFit, pointer, measureBounds])

    useFrame(() => {
        /* Browsers without requestVideoFrameCallback need an explicit pull. */
        texture?.update()
    })

    if (!texture) return null

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

export function WebglVideo({
    src,
    className,
    style,
    material,
    webglEnabled = true,
    segments = 1,
    zIndex = 0,
    autoReflow = false,
    autoPlay = true,
    muted = true,
    loop = true,
    playsInline = true,
    ...rest
}: WebglVideoProps) {
    const el = useRef<ComponentRef<"video">>(null)
    const uvFit = useRef({ x: 1, y: 1 })
    const pointer = usePointerUv(el, { enabled: webglEnabled, uvFit })

    return (
        <>
            <video
                ref={el}
                src={src}
                className={className}
                style={webglEnabled ? { ...style, opacity: 0 } : style}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                playsInline={playsInline}
                {...rest}
            />

            {webglEnabled && (
                <webglTeleport.In>
                    <Plane
                        el={el}
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
