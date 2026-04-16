"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ScrollingMarqueeProps = {
    className?: string
    fadeOnEachSide?: boolean
    itemCount?: number
    speed?: number
    children: ReactNode
}

export default function ScrollingMarquee({
    className,
    fadeOnEachSide = false,
    itemCount = 1,
    speed = 20,
    children,
}: ScrollingMarqueeProps) {
    return (
        <div className={cn("relative h-full w-full overflow-hidden cursor-default", className)}>
            {fadeOnEachSide && (
                <>
                    <span className="absolute left-0 top-0 w-[20%] h-full z-2 bg-gradient-to-l from-transparent to-background" />
                    <span className="absolute right-0 top-0 w-[20%] h-full z-2 bg-gradient-to-r from-transparent to-background" />
                </>
            )}
            <div
                className="flex a-scroll-x w-max h-full relative"
                style={{ animationDuration: `${speed}s` }}
            >
                {Array.from({ length: 3 * itemCount }, (_, index) => (
                    <div
                        key={index}
                        className="flex shrink-0 items-center"
                        aria-hidden={index > 0 ? "true" : undefined}
                    >
                        {children}
                    </div>
                ))}
            </div>
        </div>
    )
}
