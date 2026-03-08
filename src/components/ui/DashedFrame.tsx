"use client"

import { cn } from "@/lib/utils"

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

type DashedFrameProps = {
    className?: string
    children?: React.ReactNode
    fillHandles?: boolean
}

export default function DashedFrame({
    className,
    children,
    fillHandles = false,
}: DashedFrameProps) {
    return (
        <div className={cn("flex flex-col justify-between group", className)}>
            <div className="flex absolute inset-0 z-2 justify-between w-full h-full">
                <div
                    className={cn("flex flex-col justify-between h-full [&>div]:relative", {
                        "[&>div]:bg-highlight": fillHandles,
                    })}
                >
                    <div className="handle w-2.5 h-2.5 right-1 bottom-1 bg-background border-highlight border" />
                    <div className="handle w-2.5 h-2.5 right-1 -bottom-1 bg-background border-highlight border" />
                </div>
                <div
                    className={cn("flex flex-col justify-between h-full [&>div]:relative", {
                        "[&>div]:bg-highlight": fillHandles,
                    })}
                >
                    <div className="handle w-2.5 h-2.5 -right-1 -top-1 bg-background border-highlight border" />
                    <div className="handle w-2.5 h-2.5 -right-1 top-1 bg-background border-highlight border" />
                </div>
            </div>

            <svg
                aria-label="Dashed Frame"
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <rect
                    width="100"
                    height="100"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                    className="text-highlight"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="0;-24"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </rect>
            </svg>

            {children}
        </div>
    )
}
