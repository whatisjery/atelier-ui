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
    neutral: "text-accent-1 bg-bg border",
}

export default function Badge({ title, className, variant, icon, ...props }: BadgeProps) {
    return (
        <div
            {...props}
            className={cn(
                "text-xs font-regular px-1 py-[0.09rem] rounded-sm flex items-center gap-x-1",
                variantMap[variant],
                className,
            )}
        >
            {icon}
            {title}
        </div>
    )
}
