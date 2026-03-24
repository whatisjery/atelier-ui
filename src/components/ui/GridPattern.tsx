"use client"

import { type ComponentRef, useRef } from "react"
import { cn } from "@/lib/utils"

type SquareGridProps = {
    className?: string
    gridSize?: number
    strokeWidth?: number
    hoverEffect?: boolean
}

export default function GridPattern({
    className,
    gridSize = 120,
    strokeWidth = 1.5,
    hoverEffect = true,
}: SquareGridProps) {
    const size = Math.ceil(1000 / gridSize) * gridSize
    const patternId = `grid-pattern-${gridSize}-${strokeWidth}`
    const cols = Math.ceil(size / gridSize)
    const totalCells = cols * cols
    const svgRef = useRef<ComponentRef<"svg">>(null)

    const flash = () => {
        const svg = svgRef.current

        if (!svg) return
        if (!hoverEffect) return

        for (let index = 0; index < totalCells; index++) {
            // ! skips a portion of the cells
            if (Math.random() > 0.5) continue

            const col = index % cols
            const row = Math.floor(index / cols)
            const delay = Math.random() * 140

            setTimeout(() => {
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

                rect.setAttribute("x", String(col * gridSize))
                rect.setAttribute("y", String(row * gridSize))
                rect.setAttribute("width", String(gridSize))
                rect.setAttribute("height", String(gridSize))

                rect.setAttribute("fill", "var(--color-mat-1)")

                rect.setAttribute("opacity", "0.02")

                svg.appendChild(rect)
                setTimeout(() => rect.remove(), 100 + Math.random() * 100)
            }, delay)
        }
    }

    return (
        <svg
            ref={svgRef}
            aria-label="Square Grid"
            className={cn("size-full absolute inset-0", className)}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox={`1 1 ${size - 1} ${size - 1}`}
            onMouseEnter={flash}
        >
            <defs>
                <pattern
                    id={patternId}
                    width={gridSize}
                    height={gridSize}
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                        fill="none"
                        stroke="var(--color-grid)"
                        strokeWidth={strokeWidth}
                    />
                </pattern>
            </defs>
            <rect width={size} height={size} fill={`url(#${patternId})`} />
        </svg>
    )
}
