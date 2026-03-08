"use client"
import { cn } from "@/lib/utils"

type SquareGridProps = {
    className?: string
    gridSize?: number
    size?: number
    responsive?: boolean
    strokeWidth?: number
}

export default function GridPattern({
    className,
    gridSize = 68,
    size = 472,
    responsive = false,
    strokeWidth = 1,
}: SquareGridProps) {
    const patternId = `grid-pattern-${gridSize}-${strokeWidth}-${responsive ? "responsive" : "static"}`

    const viewBox = `1 1 ${size - 1} ${size - 1}`

    const svgProps = responsive
        ? { viewBox, preserveAspectRatio: "xMidYMid slice" as const }
        : { width: "100%", height: "100%" }

    return (
        <svg
            aria-label="Square Grid"
            className={cn("size-full absolute inset-0 -z-1", className, {
                "-top-0.5 -left-0.5": !responsive,
            })}
            xmlns="http://www.w3.org/2000/svg"
            {...svgProps}
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

            <rect
                width={responsive ? size : "100%"}
                height={responsive ? size : "100%"}
                fill={`url(#${patternId})`}
            />
        </svg>
    )
}
