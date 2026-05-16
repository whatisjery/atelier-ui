import { useFrame, useThree } from "@react-three/fiber"
import {
    type ComponentRef,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react"
import { CanvasTexture, type Mesh, type Texture, Vector2 } from "three"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type Pointer = {
    uv: Vector2
    hover: number
}

type WebglTextProps = {
    children: string
    segments?: number
    webglEnabled?: boolean
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">

type PlaneProps = {
    el: RefObject<ComponentRef<"span"> | null>
    text: string
    segments: number
    material?: (map: Texture, pointer: Pointer) => React.ReactNode
    pointer: Pointer
}

// Paints the content of the text on a canvas, mirroring its computed CSS typography so it looks identical to the DOM element.
function paint(el: HTMLElement, canvas: HTMLCanvasElement, width: number, height: number) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const computed = getComputedStyle(el)

    canvas.width = Math.max(1, Math.ceil(width * dpr))
    canvas.height = Math.max(1, Math.ceil(height * dpr))

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`
    ctx.letterSpacing = computed.letterSpacing
    ctx.fillStyle = computed.color
    ctx.textBaseline = "alphabetic"

    const text = el.textContent || ""
    const metrics = ctx.measureText(text)
    const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    const y = (height - fontHeight) / 2 + metrics.fontBoundingBoxAscent

    ctx.fillText(text, 0, y)
}

function Plane({ el, text, segments, material, pointer }: PlaneProps) {
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
            paint(target, canvas, rect.width, rect.height)
            texture.needsUpdate = true
        }

        measure()
        document.fonts.ready.then(measure)

        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)
        return () => ro.disconnect()
    }, [el, canvas, texture, text])

    useFrame(() => {
        const m = mesh.current
        if (!m) return
        const { x, y, width, height } = bounds.current
        const pxToWorld = viewport.height / size.height

        m.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
        m.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
        m.scale.x = width * pxToWorld
        m.scale.y = height * pxToWorld
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

export function WebglText({
    children,
    className,
    style,
    material,
    webglEnabled = true,
    segments = 1,
    ...rest
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
            <span
                ref={el}
                className={className}
                style={webglEnabled ? { ...style, opacity: 0 } : style}
                {...rest}
            >
                {children}
            </span>

            {webglEnabled && (
                <webglTeleport.In>
                    <Plane
                        el={el}
                        text={children}
                        segments={segments}
                        material={material}
                        pointer={pointer}
                    />
                </webglTeleport.In>
            )}
        </>
    )
}
