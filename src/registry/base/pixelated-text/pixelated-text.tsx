import { type ComponentRef, useEffect, useRef } from "react"
import { useFrameLoop } from "../../hooks/use-frame-loop"
import { type RenderProp, useRender } from "../../hooks/use-render"

export type PixelatedTextProps = {
    pixelSize?: number
    chaos?: number
    depth?: number
    colors?: string[]
    fps?: number
    children: React.ReactNode
    render?: RenderProp
}

function randomIndex(length: number, exclude: number) {
    if (length <= 1) return 0
    if (exclude < 0) return Math.floor(Math.random() * length)
    const index = Math.floor(Math.random() * (length - 1))
    return index >= exclude ? index + 1 : index
}

function drawText(
    ctx: CanvasRenderingContext2D,
    textEl: HTMLElement,
    color: string,
    width: number,
    height: number,
) {
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

export function PixelatedText({
    pixelSize = 5,
    chaos = 0.1,
    depth = 6,
    colors,
    fps = 200,
    children,
    render,
}: PixelatedTextProps) {
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

        let color: string

        if (colors && colors.length > 0) {
            const index = randomIndex(colors.length, state.colorIndex)
            state.colorIndex = index
            color = colors[index]
        } else {
            color = getComputedStyle(containerRef.current).color
        }

        drawText(buffer.sourceCtx, textEl, color, state.width, state.height)

        const scale = state.pixelHeight / 100
        const currentPixel = Math.max(
            2,
            Math.round((pixelSize + (Math.random() - 0.5) * depth) * scale),
        )

        const tinyWidth = Math.max(1, Math.ceil(state.pixelWidth / currentPixel))
        const tinyHeight = Math.max(1, Math.ceil(state.pixelHeight / currentPixel))

        buffer.shrink.width = tinyWidth
        buffer.shrink.height = tinyHeight

        const gridOffsetX = Math.round((Math.random() - 0.5) * currentPixel * chaos)
        const gridOffsetY = Math.round((Math.random() - 0.5) * currentPixel * chaos)

        buffer.shrinkCtx.imageSmoothingEnabled = false
        buffer.shrinkCtx.drawImage(
            buffer.source,
            gridOffsetX,
            gridOffsetY,
            state.pixelWidth,
            state.pixelHeight,
            0,
            0,
            tinyWidth,
            tinyHeight,
        )

        const dilate = Math.round(currentPixel * chaos * 0.4)

        ctx.clearRect(0, 0, state.pixelWidth, state.pixelHeight)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(
            buffer.shrink,
            0,
            0,
            tinyWidth,
            tinyHeight,
            -dilate,
            -dilate,
            state.pixelWidth + dilate * 2,
            state.pixelHeight + dilate * 2,
        )

        const randChaos = Math.random() * chaos * 3 - (chaos * 3) / 2

        canvas.style.transform = `translate(${randChaos}px, ${randChaos}px)`

        if (!state.hasRendered) {
            state.hasRendered = true
            canvas.style.opacity = "1"
            if (sizingRef.current) sizingRef.current.style.visibility = "hidden"
        }
    }, fps)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const source = document.createElement("canvas")
        const shrink = document.createElement("canvas")
        const state = stateRef.current

        bufferRef.current = {
            sourceCtx: source.getContext("2d")!,
            shrinkCtx: shrink.getContext("2d")!,
            source,
            shrink,
        }

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
    }, [])

    return useRender({
        render,
        defaultElement: <span />,
        props: {
            ref: containerRef,
            className: "relative inline-block",
            children: (
                <>
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
                </>
            ),
        },
    })
}
