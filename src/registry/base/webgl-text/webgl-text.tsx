"use client"

import { useThree } from "@react-three/fiber"
import {
    type ComponentRef,
    cloneElement,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react"
import { CanvasTexture, type Mesh, type Texture } from "three"
import { useDomPlane } from "../../hooks/use-dom-plane"
import { type Pointer, usePointerUv } from "../../hooks/use-pointer-uv"
import { type RenderProp, useRender } from "../../hooks/use-render"
import { webglTeleport } from "../webgl-portal/webgl-portal"

export type { Pointer }

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

type PaintedLine = {
    text: string
    x: number
    baseline: number
}

// Groups characters into visual lines from their rendered rects, so wrapped
// text paints exactly where the browser laid it out.
function measureLines(el: HTMLElement, origin: DOMRect, ascent: number, fontHeight: number) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    const lines: PaintedLine[] = []
    let current: PaintedLine | null = null
    let lineTop = 0

    let textNode = walker.nextNode()
    while (textNode) {
        const text = textNode.nodeValue ?? ""
        for (let offset = 0; offset < text.length; offset++) {
            const character = text[offset]
            const whitespace = /\s/.test(character)
            range.setStart(textNode, offset)
            range.setEnd(textNode, offset + 1)
            const rect = range.getBoundingClientRect()

            // Collapsed whitespace (line breaks, repeated spaces) has no box.
            if (whitespace && rect.width === 0) continue

            if (!current || Math.abs(rect.top - lineTop) > fontHeight / 2) {
                const top = rect.top + (rect.height - fontHeight) / 2
                current = {
                    text: "",
                    x: rect.left - origin.left,
                    baseline: top + ascent - origin.top,
                }
                lines.push(current)
                lineTop = rect.top
            }
            current.text += whitespace ? " " : character
        }
        textNode = walker.nextNode()
    }

    return lines
}

// Paints the content of the text on a canvas, mirroring its computed CSS typography so it looks identical to the DOM element.
function paint(el: HTMLElement, canvas: HTMLCanvasElement, rect: DOMRect, pixelRatio: number) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(pixelRatio, window.devicePixelRatio || 1)
    const { fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, color } =
        getComputedStyle(el)

    canvas.width = Math.max(1, Math.ceil(rect.width * dpr))
    canvas.height = Math.max(1, Math.ceil(rect.height * dpr))

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
    ctx.letterSpacing = letterSpacing
    ctx.fillStyle = color
    ctx.textBaseline = "alphabetic"

    const probe = ctx.measureText("Hg")
    const ascent = probe.fontBoundingBoxAscent
    const fontHeight = probe.fontBoundingBoxAscent + probe.fontBoundingBoxDescent

    for (const line of measureLines(el, rect, ascent, fontHeight)) {
        ctx.fillText(line.text, line.x, line.baseline)
    }
}

function textRect(el: HTMLElement) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const rect = range.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 ? rect : el.getBoundingClientRect()
}

function Plane({ el, segments, material, pointer, zIndex, autoReflow, pixelRatio }: PlaneProps) {
    const mesh = useRef<Mesh>(null)
    const size = useThree((s) => s.size)
    const measureBounds = useDomPlane(el, mesh, { autoReflow, getRect: textRect })

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
            const rect = measureBounds()
            if (!rect) return
            const prevWidth = canvas.width
            const prevHeight = canvas.height
            paint(target, canvas, rect, pixelRatio)

            // WebGL2 texture storage is immutable: a resized canvas can't be
            // uploaded into the old allocation, so drop it and let three
            // recreate the texture at the new size.
            if (canvas.width !== prevWidth || canvas.height !== prevHeight) texture.dispose()
            texture.needsUpdate = true
        }

        measure()
        document.fonts.ready.then(measure)

        // ResizeObserver never fires for inline elements (they have no box),
        // so document.body is watched too to catch layout-affecting resizes.
        const ro = new ResizeObserver(measure)
        ro.observe(target)
        ro.observe(document.body)

        const mo = new MutationObserver(measure)
        mo.observe(target, {
            characterData: true,
            childList: true,
            attributes: true,
            subtree: true,
        })
        mo.observe(document.documentElement, { attributes: true })
        mo.observe(document.body, { attributes: true })
        const scheme = window.matchMedia("(prefers-color-scheme: dark)")
        scheme.addEventListener("change", measure)

        return () => {
            ro.disconnect()
            mo.disconnect()
            scheme.removeEventListener("change", measure)
        }
    }, [el, canvas, texture, pixelRatio, size, measureBounds])

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
    const pointer = usePointerUv(el, { enabled: webglEnabled, getRect: textRect })

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
