"use client"

import { cn } from "@/lib/utils"

type Props = React.ComponentProps<"div"> & {
    className?: string
    direction?: "horizontal" | "vertical"
}

export default function Border({ className, direction = "horizontal" }: Props) {
    return (
        <div
            className={cn(
                "absolute z-3 bg-border",
                {
                    "h-px w-screen left-1/2 -translate-x-1/2 origin-left":
                        direction === "horizontal",
                    "w-px h-full origin-top": direction === "vertical",
                },
                className,
            )}
        />
    )
}
