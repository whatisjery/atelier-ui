"use client"

import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = keyof typeof variantMap
export type ButtonSize = keyof typeof sizeMap

type ButtonProps = {
    className?: string
    children: React.ReactNode
    variant?: ButtonVariant
    asChild?: boolean
    size?: ButtonSize
} & ComponentProps<"button">

const variantMap = {
    primary: "bg-bg text-accent-1 border hover:text-accent-3",
    secondary:
        "text-theme-fg hover:bg-theme-bg/70 bg-theme-bg border border-accent-1 dark:border-theme-bg",
    tertiary: "hover:bg-accent-5 border border-transparent hover:border-theme-border",
    dashed: "border-dashed hover:bg-accent-5 border-accent-1 border dark:border-accent-2/70 bg-bg",
    ghost: "bg-transparent hover:text-accent-3",
} as const

const sizeMap = {
    icon: "h-9 aspect-square rounded-md",
    big: "h-11 px-5.5 gap-2 font-medium rounded-sm",
    medium: "h-10 px-4 gap-2 font-medium rounded-sm",
    tag: "px-3 py-1 gap-x-1.5 text-sm rounded-sm",
} as const

export default function Button({
    children,
    className,
    variant = "tertiary",
    asChild = false,
    size = "medium",
    ...props
}: ButtonProps) {
    const Tag = asChild ? Slot.Root : "button"

    return (
        <Tag
            {...props}
            className={cn(
                "group cursor-pointer flex items-center justify-center text-sm outline-none [&:not(:hover)]:focus-visible:ring-2 [&:not(:hover)]:focus-visible:ring-ring",

                variantMap[variant],
                sizeMap[size],
                className,
            )}
        >
            {children}
        </Tag>
    )
}
