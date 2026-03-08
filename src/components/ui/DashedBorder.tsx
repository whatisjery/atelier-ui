"use client"

import { cn } from "@/lib/utils"

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

type DashedBorderProps = {
    direction?: "horizontal" | "vertical"
    dash?: number
    gap?: number
    className?: string
}

export default function DashedBorder({
    direction = "horizontal",
    dash = DEFAULT_DASH,
    gap = DEFAULT_GAP,
    className,
}: DashedBorderProps) {
    const isHorizontal = direction === "horizontal"
    const total = dash + gap

    return (
        <div
            className={cn("text-mat-3 [will-change:background-position]", className, {
                "h-px": isHorizontal,
                "w-px": !isHorizontal,
                "a-march-y": isHorizontal,
                "a-march-x": !isHorizontal,
            })}
            style={{
                background: `repeating-linear-gradient(${
                    isHorizontal ? "to right" : "to bottom"
                }, currentColor 0 ${dash}px, transparent ${dash}px ${total}px)`,
                backgroundSize: isHorizontal ? `${total}px 1px` : `1px ${total}px`,
            }}
        />
    )
}
