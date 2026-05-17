"use client"

import { type ComponentRef, useEffect, useRef } from "react"
import { useFrameLoop } from "../../hooks/use-frame-loop"

const FALL_OFF = -3.0

type DotGrid = {
    baseX: Float32Array
    baseY: Float32Array
    currentX: Float32Array
    currentY: Float32Array
    seed: Float32Array
    count: number
}

export type MagneticDotGridProps = {
    dotRadius?: number
    spacing?: number
    strength?: number
    interactionRadius?: number
    snapSpeed?: number
    returnSpeed?: number
    floatAmplitude?: number
    floatSpeed?: number
    baseColor?: string
    centerColors?: string[]
    cycleSpeed?: number
    className?: string
}

function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.replace("#", ""), 16)
    return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
}

function createGrid(width: number, height: number, spacing: number): DotGrid {
    const cols = Math.floor(width / spacing) + 1
    const rows = Math.floor(height / spacing) + 1
    const count = cols * rows

    const offsetX = (width - (cols - 1) * spacing) / 2
    const offsetY = (height - (rows - 1) * spacing) / 2

    const baseX = new Float32Array(count)
    const baseY = new Float32Array(count)
    const currentX = new Float32Array(count)
    const currentY = new Float32Array(count)
    const seed = new Float32Array(count)

    let index = 0

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = offsetX + col * spacing
            const y = offsetY + row * spacing
            baseX[index] = x
            baseY[index] = y
            currentX[index] = x
            currentY[index] = y
            seed[index] = Math.random() * 1000
            index++
        }
    }

    return {
        baseX,
        baseY,
        currentX,
        currentY,
        count,
        seed,
    }
}

export function MagneticDotGrid({
    dotRadius = 0.6,
    spacing = 16,
    strength = 20,
    interactionRadius = 500,
    snapSpeed = 9,
    returnSpeed = 5,
    floatAmplitude = 1.8,
    floatSpeed = 2,
    baseColor = "#000000",
    centerColors = ["#BCBCBC"],
    cycleSpeed = 1.5,
    className,
}: MagneticDotGridProps) {
    const canvasRef = useRef<ComponentRef<"canvas">>(null)
    const gridRef = useRef<DotGrid | null>(null)
    const pointerRef = useRef({ x: 0, y: 0, active: false })
    const baseColorRef = useRef(hexToRgb(baseColor))
    const centerColorsRef = useRef(centerColors.map(hexToRgb))

    useEffect(() => {
        baseColorRef.current = hexToRgb(baseColor)
        centerColorsRef.current = centerColors.map(hexToRgb)
    }, [baseColor, centerColors])

    useFrameLoop((time, delta) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        const grid = gridRef.current
        if (!grid || !ctx) return

        const pointer = pointerRef.current
        const parsedCenterColors = centerColorsRef.current
        const parsedBaseColor = baseColorRef.current
        const progress = ((time * cycleSpeed) % 1) * parsedCenterColors.length
        const currentColorIndex = Math.floor(progress) % parsedCenterColors.length
        const nextColorIndex = (currentColorIndex + 1) % parsedCenterColors.length
        const blend = progress - Math.floor(progress)
        const currentColor = parsedCenterColors[currentColorIndex]
        const nextColor = parsedCenterColors[nextColorIndex]

        const centerR = currentColor[0] + (nextColor[0] - currentColor[0]) * blend
        const centerG = currentColor[1] + (nextColor[1] - currentColor[1]) * blend
        const centerB = currentColor[2] + (nextColor[2] - currentColor[2]) * blend

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

        const interactionRadiusSq = interactionRadius * interactionRadius

        for (let i = 0; i < grid.count; i++) {
            const bx = grid.baseX[i]
            const by = grid.baseY[i]
            const seed = grid.seed[i]

            let targetX = bx
            let targetY = by

            let influence = 0

            if (pointer.active) {
                const dx = bx - pointer.x
                const dy = by - pointer.y
                const distSq = dx * dx + dy * dy

                if (distSq < interactionRadiusSq) {
                    const dist = Math.sqrt(distSq)
                    const normalizedDist = dist / interactionRadius

                    influence = Math.exp(FALL_OFF * normalizedDist * normalizedDist)

                    if (dist > 0.001) {
                        const force = influence * strength
                        targetX += (dx / dist) * force
                        targetY += (dy / dist) * force
                    }
                }
            }

            const amp = floatAmplitude * influence
            const floatX = Math.sin(time * floatSpeed + seed) * amp
            const floatY = Math.sin(time * floatSpeed * 0.6 + seed * 1.3) * amp

            targetX += floatX
            targetY += floatY

            const speed = influence > 0.01 ? snapSpeed : returnSpeed
            const factor = 1 - Math.exp(-speed * delta)

            grid.currentX[i] += (targetX - grid.currentX[i]) * factor
            grid.currentY[i] += (targetY - grid.currentY[i]) * factor

            const r = parsedBaseColor[0] + (centerR - parsedBaseColor[0]) * influence
            const g = parsedBaseColor[1] + (centerG - parsedBaseColor[1]) * influence
            const b = parsedBaseColor[2] + (centerB - parsedBaseColor[2]) * influence

            ctx.fillStyle = `rgb(${r},${g},${b})`
            ctx.fillRect(
                grid.currentX[i] - dotRadius,
                grid.currentY[i] - dotRadius,
                dotRadius * 2,
                dotRadius * 2,
            )
        }
    })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) return

        const updatePointer = (clientX: number, clientY: number) => {
            const canvas = canvasRef.current
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            pointerRef.current.x = clientX - rect.left
            pointerRef.current.y = clientY - rect.top
            pointerRef.current.active = true
        }

        const handlePointerMove = (event: PointerEvent) => {
            updatePointer(event.clientX, event.clientY)
        }

        const handlePointerLeave = () => {
            pointerRef.current.active = false
        }

        const displayGrid = () => {
            const dpr = window.devicePixelRatio || 1
            const width = canvas.clientWidth
            const height = canvas.clientHeight

            canvas.width = width * dpr
            canvas.height = height * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            gridRef.current = createGrid(width, height, spacing)
        }

        displayGrid()
        const observer = new ResizeObserver(displayGrid)
        observer.observe(canvas)
        canvas.addEventListener("pointermove", handlePointerMove)
        canvas.addEventListener("pointerleave", handlePointerLeave)

        return () => {
            observer.disconnect()
            canvas.removeEventListener("pointermove", handlePointerMove)
            canvas.removeEventListener("pointerleave", handlePointerLeave)
        }
    }, [spacing])

    return (
        <canvas
            ref={canvasRef}
            className={className ?? "absolute inset-0 touch-none w-full h-full"}
        />
    )
}
