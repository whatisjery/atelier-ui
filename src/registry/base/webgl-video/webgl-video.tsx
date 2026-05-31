import { useFrame, useThree } from "@react-three/fiber"
import {
    type ComponentRef,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { type Mesh, SRGBColorSpace, type Texture, Vector2, VideoTexture } from "three"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type Pointer = {
    uv: Vector2
    hover: number
}

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
    zIndex: number
    autoReflow: boolean
}

function Plane({ el, segments, material, pointer, zIndex, autoReflow }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const [texture, setTexture] = useState<VideoTexture | null>(null)
    const size = useThree((state) => state.size)
    const viewport = useThree((state) => state.viewport)
    const fitScale = useRef({ x: 1, y: 1 })
    const bounds = useRef({ x: 0, y: 0, width: 0, height: 0 })

    useLayoutEffect(() => {
        const video = el.current
        if (!video) return

        // Build the texture from the DOM <video> itself so a single element
        // decodes once; VideoTexture pulls each new frame from it.
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
            const video = texture.image as HTMLVideoElement
            const objectFit = getComputedStyle(target).objectFit
            const planeAspect = rect.width / rect.height
            const videoAspect = video.videoWidth / video.videoHeight

            let repeatU = 1
            let repeatV = 1

            fitScale.current.x = 1
            fitScale.current.y = 1

            // videoWidth/Height are 0 until metadata loads; skip cropping until then.
            if (video.videoWidth > 0) {
                if (objectFit === "cover") {
                    if (planeAspect > videoAspect) {
                        repeatV = videoAspect / planeAspect
                    } else {
                        repeatU = planeAspect / videoAspect
                    }
                } else if (objectFit === "contain") {
                    if (planeAspect > videoAspect) {
                        fitScale.current.x = videoAspect / planeAspect
                    } else {
                        fitScale.current.y = planeAspect / videoAspect
                    }
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

        // Re-measure once the video reports its intrinsic size.
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
    }, [el, texture, segments])

    useFrame(() => {
        const m = mesh.current
        if (!m) return

        // Browsers without requestVideoFrameCallback need an explicit pull.
        texture?.update()

        const pxToWorld = viewport.height / size.height

        // autoReflow re-reads the rect each frame so the mesh follows parent
        // CSS transforms (e.g. parallax). One layout read per frame.
        if (autoReflow && el.current) {
            const rect = el.current.getBoundingClientRect()
            m.position.x = (rect.left + rect.width / 2 - size.width / 2) * pxToWorld
            m.position.y = -(rect.top + rect.height / 2 - size.height / 2) * pxToWorld
            m.scale.x = rect.width * pxToWorld * fitScale.current.x
            m.scale.y = rect.height * pxToWorld * fitScale.current.y
            return
        }

        const { x, y, width, height } = bounds.current
        m.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
        m.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
        m.scale.x = width * pxToWorld * fitScale.current.x
        m.scale.y = height * pxToWorld * fitScale.current.y
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

        // Pointer events still fire on the DOM element through opacity:0,
        // so the browser tells us when the cursor is over it.
        const onMove = (event: PointerEvent) => {
            const { width, left, top, height } = target.getBoundingClientRect()
            const x = (event.clientX - left) / width
            const y = 1 - (event.clientY - top) / height
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
                        zIndex={zIndex}
                        autoReflow={autoReflow}
                    />
                </webglTeleport.In>
            )}
        </>
    )
}
