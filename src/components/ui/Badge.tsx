"use client"

import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = keyof typeof variantMap

type BadgeProps = {
    className?: string
    title: string
    variant: BadgeVariant
} & ComponentProps<"div">

const variantMap = {
    wip: "bg-accent-focus/10 text-accent-focus",
    new: "bg-accent-calm/12 text-accent-calm",
    update: "bg-accent-neutral/12 text-accent-neutral",
}

export default function Badge({ title, className, variant, ...props }: BadgeProps) {
    return (
        <div
            {...props}
            className={cn(
                "text-xs font-medium px-2 py-1 rounded-sm",
                variantMap[variant],
                className,
            )}
        >
            {title}
        </div>
    )
}
