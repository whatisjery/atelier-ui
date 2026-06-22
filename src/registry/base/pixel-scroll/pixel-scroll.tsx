import { useScroll } from "motion/react"
import { type ComponentRef, type RefObject, useEffect, useMemo, useRef, useState } from "react"

const MAX_DENSITY = 200

type Cell = {
    color: string | null
    fillAt: number
    flashAt: number
}

export type PixelScrollProps = {
    density?: number
    colors?: string[]
    colorRatio?: number
    randomness?: number
    direction?: "cover" | "clear" | "sweep"
    scrollTargetRef?: RefObject<HTMLElement | null>
    className?: string
}

function cover(cell: Cell, progress: number, settled: string) {
    if (progress > cell.fillAt) return settled
    if (cell.color && progress > cell.flashAt) return cell.color
    return null
}

function clear(cell: Cell, progress: number, settled: string) {
    if (progress < cell.flashAt) return settled
    if (cell.color && progress < cell.fillAt) return cell.color
    return null
}

function sweep(cell: Cell, progress: number, settled: string) {
    if (progress <= 0.5) return cover(cell, progress * 2, settled)
    return clear(cell, (progress - 0.5) * 2, settled)
}

export default function PixelScroll({
    density = 20,
    colors = [],
    colorRatio = 0.25,
    randomness = 0.4,
    direction = "cover",
    scrollTargetRef,
    className,
}: PixelScrollProps) {
    const [size, setSize] = useState({ width: 0, height: 0, rows: 0 })
    const canvasRef = useRef<ComponentRef<"canvas">>(null)
    const cols = Math.min(density, MAX_DENSITY)

    const { scrollYProgress } = useScroll({
        target: scrollTargetRef ?? canvasRef,
        offset: scrollTargetRef ? ["start start", "end end"] : ["start end", "start start"],
    })

    useEffect(() => {
        const element = canvasRef.current
        if (!element) return

        const observer = new ResizeObserver(([{ contentRect }]) => {
            const { width, height } = contentRect
            if (width && height) {
                const rows = Math.max(1, Math.round(height / (width / cols)))
                setSize({ width, height, rows })
            }
        })

        observer.observe(element)
        return () => observer.disconnect()
    }, [cols])

    const cells = useMemo(
        () =>
            Array.from({ length: cols * size.rows }, (_, index) => {
                const row = Math.floor(index / cols)
                const height = (size.rows - 1 - row) / Math.max(1, size.rows - 1)
                const fillAt = Math.min(1, height * (1 - randomness) + Math.random() * randomness)
                const flashes = colors.length > 0 && Math.random() < colorRatio
                const color = flashes ? colors[Math.floor(Math.random() * colors.length)] : null

                return {
                    color,
                    fillAt,
                    flashAt: color ? Math.max(0, fillAt - 0.08) : fillAt,
                }
            }),
        [cols, size.rows, colors, colorRatio, randomness],
    )

    useEffect(() => {
        function paintOnScroll() {
            const canvas = canvasRef.current
            if (!canvas || !size.width || !size.height) return
            const context = canvas.getContext("2d")
            if (!context) return

            const { width, height, rows } = size
            const pixelRatio = window.devicePixelRatio || 1
            canvas.width = Math.round(width * pixelRatio)
            canvas.height = Math.round(height * pixelRatio)
            context.scale(pixelRatio, pixelRatio)

            const cellWidth = width / cols
            const cellHeight = height / rows

            let fillOf = cover
            if (direction === "clear") fillOf = clear
            if (direction === "sweep") fillOf = sweep

            let settledColor = getComputedStyle(canvas).color

            const paint = (progress: number) => {
                context.clearRect(0, 0, width, height)
                for (let index = 0; index < cells.length; index++) {
                    const fillColor = fillOf(cells[index], progress, settledColor)

                    if (fillColor) {
                        const cellX = (index % cols) * cellWidth
                        const cellY = Math.floor(index / cols) * cellHeight
                        context.fillStyle = fillColor
                        context.fillRect(
                            Math.floor(cellX),
                            Math.floor(cellY),
                            Math.ceil(cellWidth),
                            Math.ceil(cellHeight),
                        )
                    }
                }
            }

            paint(scrollYProgress.get())
            const unsubscribe = scrollYProgress.on("change", paint)

            // Canvas pixels are painted by hand, so unlike CSS they don't restyle when the root's class or data-theme changes. Repaint when they do.
            const observer = new MutationObserver(() => {
                settledColor = getComputedStyle(canvas).color
                paint(scrollYProgress.get())
            })

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["class", "data-theme"],
            })

            return () => {
                unsubscribe()
                observer.disconnect()
            }
        }

        return paintOnScroll()
    }, [size, cells, cols, direction, scrollYProgress])

    return (
        // Canvas redraws the whole grid each scroll frame in a single loop, instead of using a div per pixel (for performance reasons)
        <canvas ref={canvasRef} className={`block size-full ${className ?? ""}`} />
    )
}
