import { type ComponentRef, useEffect, useRef } from "react"
import { useFrameLoop } from "../../hooks/use-frame-loop"

export type PixelatedTextProps = {
    pixelSize?: number
    flicker?: number
    chaos?: number
    depth?: number
    aberration?: number
    colors?: string[]
    speed?: number
    children: React.ReactNode
    className?: string
    as?: React.ElementType
}

type DrawTextProps = {
    ctx: CanvasRenderingContext2D
    textEl: HTMLElement
    color: string
    width: number
    height: number
}

type PixelateProps = {
    source: HTMLCanvasElement
    output: CanvasRenderingContext2D
    shrinkCanvas: HTMLCanvasElement
    shrinkCtx: CanvasRenderingContext2D
    pixelWidth: number
    pixelHeight: number
    currentPixel: number
    chaos: number
    className?: string
}

function aberrationFilter(aberration: number) {
    if (aberration === 0) return ""
    return [
        `drop-shadow(${aberration}px 0 0 rgba(255,0,0,0.5))`,
        `drop-shadow(-${aberration}px 0 0 rgba(0,0,255,0.5))`,
    ].join(" ")
}

function getContext(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context not supported")
    return ctx
}

function randomIndex(length: number, exclude: number) {
    if (length <= 1) return 0
    const index = Math.floor(Math.random() * (length - 1))
    return index >= exclude ? index + 1 : index
}

function drawText({ ctx, textEl, color, width, height }: DrawTextProps) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const computed = getComputedStyle(textEl)

    ctx.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`
    ctx.letterSpacing = computed.letterSpacing

    // match browser baseline placement relative to the font em square
    const metrics = ctx.measureText(textEl.textContent || "")
    const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
    const leading = height - fontHeight
    const y = leading / 2 + metrics.fontBoundingBoxAscent

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = color
    ctx.textBaseline = "alphabetic"
    ctx.fillText(textEl.textContent || "", 0, y)
}

function pixelate({
    source,
    output,
    shrinkCanvas,
    shrinkCtx,
    pixelWidth,
    pixelHeight,
    currentPixel,
    chaos,
}: PixelateProps) {
    const tinyWidth = Math.max(1, Math.ceil(pixelWidth / currentPixel))
    const tinyHeight = Math.max(1, Math.ceil(pixelHeight / currentPixel))

    shrinkCanvas.width = tinyWidth
    shrinkCanvas.height = tinyHeight

    const gridOffsetX = Math.round((Math.random() - 0.5) * currentPixel * chaos)
    const gridOffsetY = Math.round((Math.random() - 0.5) * currentPixel * chaos)

    shrinkCtx.imageSmoothingEnabled = false
    shrinkCtx.drawImage(
        source,
        gridOffsetX,
        gridOffsetY,
        pixelWidth,
        pixelHeight,
        0,
        0,
        tinyWidth,
        tinyHeight,
    )

    output.clearRect(0, 0, pixelWidth, pixelHeight)
    output.imageSmoothingEnabled = false

    const dilate = Math.round(currentPixel * chaos * 0.4)

    output.drawImage(
        shrinkCanvas,
        0,
        0,
        tinyWidth,
        tinyHeight,
        -dilate,
        -dilate,
        pixelWidth + dilate * 2,
        pixelHeight + dilate * 2,
    )
}

export function PixelatedText({
    as,
    pixelSize = 2,
    flicker = 1.5,
    chaos = 0.1,
    depth = 1,
    aberration = 0,
    colors,
    speed = 200,
    children,
    className,
}: PixelatedTextProps) {
    // biome-ignore lint/suspicious/noExplicitAny: Polymorphic component
    const Tag = (as || "span") as any

    const sizingRef = useRef<ComponentRef<"span">>(null)
    const containerRef = useRef<ComponentRef<"span">>(null)
    const canvasRef = useRef<ComponentRef<"canvas">>(null)

    const bufferRef = useRef<{
        source: HTMLCanvasElement
        sourceCtx: CanvasRenderingContext2D
        shrink: HTMLCanvasElement
        shrinkCtx: CanvasRenderingContext2D
    } | null>(null)

    const stateRef = useRef({
        width: 0,
        height: 0,
        pixelWidth: 0,
        pixelHeight: 0,
        colorIndex: -1,
        hasRendered: false,
    })

    useFrameLoop(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        const textEl = sizingRef.current
        const buffer = bufferRef.current
        if (!canvas || !ctx || !textEl || !buffer || !containerRef.current) return

        const state = stateRef.current
        const fallback = getComputedStyle(containerRef.current).color

        let color = fallback
        if (colors && colors.length > 0) {
            const index = randomIndex(colors.length, state.colorIndex)
            state.colorIndex = index
            color = colors[index]
        }

        drawText({
            ctx: buffer.sourceCtx,
            textEl: textEl,
            color: color,
            width: state.width,
            height: state.height,
        })

        const baseFlicker = 1 + flicker * 2.5
        const randomFlicker = Math.random() * flicker * 1.2
        const randomDepth = depth * pixelSize * 5 * (Math.random() - 0.3)

        const currentPixel = Math.max(
            2,
            Math.round(pixelSize * (baseFlicker + randomFlicker) + randomDepth),
        )

        pixelate({
            source: buffer.source,
            output: ctx,
            shrinkCanvas: buffer.shrink,
            shrinkCtx: buffer.shrinkCtx,
            pixelWidth: state.pixelWidth,
            pixelHeight: state.pixelHeight,
            currentPixel,
            chaos,
        })

        const randChaos = Math.random() * chaos * 3 - (chaos * 3) / 2

        canvas.style.transform = `translate(${randChaos}px, ${randChaos}px)`

        if (!state.hasRendered) {
            state.hasRendered = true
            canvas.style.opacity = "1"
            if (sizingRef.current) sizingRef.current.style.visibility = "hidden"
        }
    }, speed)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const source = document.createElement("canvas")
        const shrink = document.createElement("canvas")
        const state = stateRef.current

        bufferRef.current = {
            source: source,
            sourceCtx: getContext(source),
            shrink: shrink,
            shrinkCtx: getContext(shrink),
        }

        canvas.style.willChange = "transform"
        canvas.style.filter = aberrationFilter(aberration)

        const measure = () => {
            const textEl = sizingRef.current
            if (!textEl) return

            const rect = textEl.getBoundingClientRect()
            const dpr = Math.min(window.devicePixelRatio || 1, 2)

            if (rect.width === 0 || rect.height === 0) return

            state.width = rect.width
            state.height = rect.height
            state.pixelWidth = Math.ceil(rect.width * dpr)
            state.pixelHeight = Math.ceil(rect.height * dpr)

            source.width = state.pixelWidth
            source.height = state.pixelHeight

            canvas.width = state.pixelWidth
            canvas.height = state.pixelHeight
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`
        }

        document.fonts.ready.then(measure)
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
            bufferRef.current = null
            stateRef.current.hasRendered = false
            if (sizingRef.current) sizingRef.current.style.visibility = ""
        }
    }, [aberration])

    return (
        <Tag ref={containerRef} className={`relative inline-block ${className}`}>
            <span ref={sizingRef} aria-hidden="true" className="inline-block">
                {children}
            </span>

            <span className="sr-only">{children}</span>

            <canvas
                tabIndex={-1}
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none touch-none"
                style={{ opacity: 0 }}
                aria-hidden="true"
            />
        </Tag>
    )
}
