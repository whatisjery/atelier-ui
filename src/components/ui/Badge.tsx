"use client"

import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = keyof typeof variantMap

type BadgeProps = {
    className?: string
    title: string
    variant: BadgeVariant
    icon?: React.ReactNode
} & ComponentProps<"div">

const variantMap = {
    focus: "bg-accent-focus/10 text-accent-focus",
    calm: "bg-accent-calm/12 text-accent-calm",
    neutral: "text-mat-1 bg-background border",
}

export default function Badge({ title, className, variant, icon, ...props }: BadgeProps) {
    return (
        <div
            {...props}
            className={cn(
                "text-xs font-regular px-1.5 py-[0.15rem] rounded-md flex items-center gap-x-1",
                variantMap[variant],
                className,
            )}
        >
            {icon}
            {title}
        </div>
    )
}
