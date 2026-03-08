"use client"

import { Tooltip as TooltipPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/utils"

type TooltipProps = {
    title: React.ReactNode
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
    className?: string
    children: React.ReactNode
}

export default function Tooltip({
    title,
    side = "top",
    sideOffset = 2,
    className,
    children,
}: TooltipProps) {
    return (
        <TooltipPrimitive.Root delayDuration={0}>
            <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    sideOffset={sideOffset}
                    className={cn(
                        "z-50 bg-mat-1 text-background font-medium rounded-full px-2.5 py-1 text-xs",
                        "data-[state=delayed-open]:a-fade-in",
                        "data-[state=closed]:a-fade-out",
                        className,
                    )}
                >
                    {title}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    )
}
