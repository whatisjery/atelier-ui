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
    warning: "text-warning-fg bg-warning-bg border border-warning-border",
}

export default function Badge({ title, className, variant, icon, ...props }: BadgeProps) {
    return (
        <div
            {...props}
            className={cn(
                "text-[0.6rem] font-medium tracking-tight f uppercase px-[0.32rem] py-[0.09rem] rounded-sm flex items-center gap-x-1 min-w-0",
                variantMap[variant],
                className,
            )}
        >
            {icon}
            <span className="min-w-0 truncate">{title}</span>
        </div>
    )
}
