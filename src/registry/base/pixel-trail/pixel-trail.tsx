"use client"

import { useEffect, useRef } from "react"

interface PixelTrailProps {
    mode?: "color" | "sample"
    color?: string
    imageSelector?: string
    lightenSample?: number
    pixelSize?: number
    trailRadius?: number
    lifetime?: number
    fade?: number
    showGrid?: boolean
    gridColor?: string
    gridThickness?: number
    className?: string
}

type ColorSampler = (screenX: number, screenY: number) => string | null

interface Pixel {
    posX: number
    posY: number
    lifetime: number
    fade: number
    color: string
}

function getContext(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context not supported")
    return ctx
}

function toRGB(data: Uint8ClampedArray, offset: number, lightenSample: number) {
    const red = Math.min(255, data[offset] + lightenSample)
    const green = Math.min(255, data[offset + 1] + lightenSample)
    const blue = Math.min(255, data[offset + 2] + lightenSample)
    return `rgb(${red},${green},${blue})`
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max))
}

function createImageSampler(img: HTMLImageElement, lightenSample: number): ColorSampler {
    const offscreen = document.createElement("canvas")
    offscreen.width = img.naturalWidth
    offscreen.height = img.naturalHeight

    try {
        const ctx = getContext(offscreen)
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)

        return (screenX, screenY) => {
            const rect = img.getBoundingClientRect()
            if (
                screenX < rect.left ||
                screenX > rect.right ||
                screenY < rect.top ||
                screenY > rect.bottom
            ) {
                return null
            }

            const pixelX = clamp(
                Math.floor(((screenX - rect.left) / rect.width) * offscreen.width),
                0,
                offscreen.width - 1,
            )

            const pixelY = clamp(
                Math.floor(((screenY - rect.top) / rect.height) * offscreen.height),
                0,
                offscreen.height - 1,
            )

            const offset = (pixelY * imageData.width + pixelX) * 4
            return toRGB(imageData.data, offset, lightenSample)
        }
    } catch {
        return () => null
    }
}

export function PixelTrail({
    mode = "color",
    color = "#000000",
    imageSelector = "img",
    lightenSample = 20,
    pixelSize = 20,
    trailRadius = 2,
    lifetime = 1,
    fade = 0.5,
    showGrid = false,
    gridColor = "rgba(255, 255, 255, 0.1)",
    gridThickness = 1,
    className,
}: PixelTrailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = getContext(canvas)
        const pixels: Pixel[] = []
        const samplers: ColorSampler[] = []
        const canvasSize = { width: 0, height: 0 }

        let frameId = 0
        let lastTime = performance.now()

        function rebuildSamplers() {
            samplers.length = 0

            if (mode !== "sample") return

            document.querySelectorAll<HTMLImageElement>(imageSelector).forEach((img) => {
                if (img.complete && img.naturalWidth > 0) {
                    samplers.push(createImageSampler(img, lightenSample))
                }
            })
        }

        rebuildSamplers()

        if (mode === "sample") {
            document.querySelectorAll<HTMLImageElement>(imageSelector).forEach((img) => {
                if (!img.complete) {
                    img.addEventListener("load", () => rebuildSamplers(), { once: true })
                }
            })
        }

        function getColorAt(screenX: number, screenY: number): string {
            for (const sampler of samplers) {
                const sampled = sampler(screenX, screenY)
                if (sampled) return sampled
            }
            return color
        }

        function addPixels(clientX: number, clientY: number) {
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const localX = clientX - rect.left
            const localY = clientY - rect.top

            const gridX = Math.floor(localX / pixelSize)
            const gridY = Math.floor(localY / pixelSize)

            for (let offsetX = -trailRadius; offsetX <= trailRadius; offsetX++) {
                for (let offsetY = -trailRadius; offsetY <= trailRadius; offsetY++) {
                    if (offsetX * offsetX + offsetY * offsetY > trailRadius * trailRadius) continue
                    if (trailRadius > 0 && Math.random() < 0.75) continue

                    const posX = (gridX + offsetX) * pixelSize
                    const posY = (gridY + offsetY) * pixelSize

                    pixels.push({
                        posX,
                        posY,
                        lifetime: lifetime * (0.2 + Math.random() ** 2 * 0.8),
                        fade: 0,
                        color: getColorAt(
                            posX + rect.left + pixelSize * 0.5,
                            posY + rect.top + pixelSize * 0.5,
                        ),
                    })
                }
            }
        }

        function updatePixels(delta: number) {
            for (let index = pixels.length - 1; index >= 0; index--) {
                pixels[index].fade += delta
                if (pixels[index].fade >= pixels[index].lifetime) {
                    pixels[index] = pixels[pixels.length - 1]
                    pixels.pop()
                }
            }
        }

        function drawPixels() {
            for (const pixel of pixels) {
                const remaining = pixel.lifetime - pixel.fade
                ctx.globalAlpha = fade > 0 ? Math.min(1, remaining / fade) : 1
                ctx.fillStyle = pixel.color
                ctx.fillRect(pixel.posX, pixel.posY, pixelSize, pixelSize)
            }
            ctx.globalAlpha = 1
        }

        function resize() {
            if (!canvas) return

            const dpr = window.devicePixelRatio || 1
            canvasSize.width = canvas.clientWidth
            canvasSize.height = canvas.clientHeight
            canvas.width = canvasSize.width * dpr
            canvas.height = canvasSize.height * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        function loop(now: number) {
            const delta = Math.min((now - lastTime) / 1000, 0.1)
            lastTime = now
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
            updatePixels(delta)
            drawPixels()
            frameId = requestAnimationFrame(loop)
        }

        const onMouseMove = (event: MouseEvent) => addPixels(event.clientX, event.clientY)
        const onTouchMove = (event: TouchEvent) => {
            for (let index = 0; index < event.touches.length; index++) {
                addPixels(event.touches[index].clientX, event.touches[index].clientY)
            }
        }

        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(canvas)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("touchmove", onTouchMove, { passive: true })
        resize()
        frameId = requestAnimationFrame(loop)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("touchmove", onTouchMove)
            cancelAnimationFrame(frameId)
        }
    }, [mode, color, imageSelector, lightenSample, pixelSize, trailRadius, lifetime, fade])

    return (
        <div className={className}>
            {showGrid && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: `${pixelSize}px ${pixelSize}px`,
                        backgroundImage: [
                            `linear-gradient(to right, ${gridColor} ${gridThickness}px, transparent ${gridThickness}px)`,
                            `linear-gradient(to bottom, ${gridColor} ${gridThickness}px, transparent ${gridThickness}px)`,
                        ].join(", "),
                    }}
                />
            )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    )
}
