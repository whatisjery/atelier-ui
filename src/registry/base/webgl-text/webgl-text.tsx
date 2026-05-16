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
import { webglTeleport } from "../webgl-rig/webgl-rig"

export type WebglTextPointer = {
    uv: Vector2
    hover: number
}

type Bounds = {
    x: number
    y: number
    width: number
    height: number
}

type WebglTextProps = {
    children: string
    segments?: number
    webglEnabled?: boolean
    material?: (map: Texture, pointer: WebglTextPointer) => React.ReactNode
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">

type PlaneProps = {
    el: RefObject<ComponentRef<"span"> | null>
    text: string
    segments: number
    material?: (map: Texture, pointer: WebglTextPointer) => React.ReactNode
    pointer: WebglTextPointer
}

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
            paint(target, canvas, r.width, r.height)
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
        const b = bounds.current
        m.position.x = b.x + b.width / 2 - window.scrollX - size.width / 2
        m.position.y = -(b.y + b.height / 2 - window.scrollY - size.height / 2)
        m.scale.x = b.width
        m.scale.y = b.height
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
    const pointer = useMemo<WebglTextPointer>(() => {
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
