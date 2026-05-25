import { useFrame, useThree } from "@react-three/fiber"
import {
    type ComponentRef,
    cloneElement,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react"
import { CanvasTexture, type Mesh, type Texture, Vector2 } from "three"
import { type RenderProp, useRender } from "../../hooks/use-render"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type Pointer = {
    uv: Vector2
    hover: number
}

type WebglTextProps = {
    children: string
    webglEnabled?: boolean
    render?: RenderProp
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    zIndex?: number
    segments?: number
    pixelRatio?: number
    /**
     * Re-measures the DOM rect every frame so the plane follows animated parents (motion, parallax).
     * Costs one layout read per frame, so only enable it when needed.
     */
    autoReflow?: boolean
}

type PlaneProps = {
    el: RefObject<ComponentRef<"span"> | null>
    segments: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    pointer: Pointer
    zIndex: number
    autoReflow: boolean
    pixelRatio: number
}

// Paints the content of the text on a canvas, mirroring its computed CSS typography so it looks identical to the DOM element.
function paint(
    el: HTMLElement,
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    pixelRatio: number,
) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(pixelRatio, window.devicePixelRatio || 1)
    const { fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, color } =
        getComputedStyle(el)

    canvas.width = Math.max(1, Math.ceil(width * dpr))
    canvas.height = Math.max(1, Math.ceil(height * dpr))

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
    ctx.letterSpacing = letterSpacing
    ctx.fillStyle = color
    ctx.textBaseline = "alphabetic"

    const text = el.textContent || ""
    const metrics = ctx.measureText(text)
    const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    const y = (height - fontHeight) / 2 + metrics.fontBoundingBoxAscent

    ctx.fillText(text, 0, y)
}

function Plane({ el, segments, material, pointer, zIndex, autoReflow, pixelRatio }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const size = useThree((s) => s.size)
    const viewport = useThree((s) => s.viewport)
    const bounds = useRef({ x: 0, y: 0, width: 0, height: 0 })

    const { canvas, texture } = useMemo(() => {
        const canvas = document.createElement("canvas")
        const texture = new CanvasTexture(canvas)
        return { canvas, texture }
    }, [])

    useEffect(() => {
        return () => {
            texture.dispose()
        }
    }, [texture])

    useLayoutEffect(() => {
        const target = el.current
        if (!target) return

        const measure = () => {
            // Rect in document coords (top/left offset by current scroll at measure time),
            // so we can later derive viewport position with just `window.scrollX/Y`,
            // instead of recalculating bounds on every render
            const rect = target.getBoundingClientRect()
            bounds.current.x = rect.left + window.scrollX
            bounds.current.y = rect.top + window.scrollY
            bounds.current.width = rect.width
            bounds.current.height = rect.height
            paint(target, canvas, rect.width, rect.height, pixelRatio)
        }

        measure()
        document.fonts.ready.then(measure)
        const ro = new ResizeObserver(measure)
        ro.observe(target)

        return () => {
            ro.disconnect()
        }
    }, [el, canvas, texture, pixelRatio])

    useFrame(() => {
        const m = mesh.current
        if (!m) return
        const pxToWorld = viewport.height / size.height

        // autoReflow re-reads the rect each frame so the mesh follows parent
        // CSS transforms (e.g. parallax). One layout read per frame.
        if (autoReflow && el.current) {
            const rect = el.current.getBoundingClientRect()
            m.position.x = (rect.left + rect.width / 2 - size.width / 2) * pxToWorld
            m.position.y = -(rect.top + rect.height / 2 - size.height / 2) * pxToWorld
            m.scale.x = rect.width * pxToWorld
            m.scale.y = rect.height * pxToWorld
            return
        }

        const { x, y, width, height } = bounds.current
        m.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
        m.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
        m.scale.x = width * pxToWorld
        m.scale.y = height * pxToWorld
    })

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

export function WebglText({
    children,
    material,
    webglEnabled = true,
    segments = 1,
    render,
    zIndex = 0,
    autoReflow = false,
    pixelRatio = 2,
}: WebglTextProps) {
    const el = useRef<ComponentRef<"span">>(null)
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

    const element = useRender({
        render,
        defaultElement: <span />,
        props: { ref: el, children },
    })

    // Force opacity:0 to win when WebGL is on, so a consumer can't accidentally
    // un-hide the DOM fallback through their render element's style.
    const host = webglEnabled
        ? cloneElement(element, { style: { ...element.props.style, opacity: 0 } })
        : element

    return (
        <>
            {host}

            {webglEnabled && (
                <webglTeleport.In>
                    <Plane
                        el={el}
                        segments={segments}
                        material={material}
                        pointer={pointer}
                        zIndex={zIndex}
                        autoReflow={autoReflow}
                        pixelRatio={pixelRatio}
                    />
                </webglTeleport.In>
            )}
        </>
    )
}
