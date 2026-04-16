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
    primary: "bg-background text-mat-1 border hover:text-mat-2",
    secondary: "text-background bg-mat-1 hover:text-background/80",
    tertiary: "bg-mat-5/80 border hover:bg-mat-5/50 hover:border-mat-3/50",
    muted: "bg-transparent text-mat-2 hover:text-mat-1",
    "ghost-solid": "bg-transparent hover:bg-mat-5/80 border hover:border-border border-transparent",
    "ghost-transparent": "bg-transparent hover:text-mat-2",
} as const

const sizeMap = {
    icon: "h-9 aspect-square",
    rect: "h-9 px-4 gap-2",
    big: "h-11 p-5 rounded-full",
} as const

export default function Button({
    children,
    className,
    variant = "tertiary",
    asChild = false,
    size = "rect",
    ...props
}: ButtonProps) {
    const Tag = asChild ? Slot.Root : "button"

    return (
        <Tag
            {...props}
            className={cn(
                "group cursor-pointer rounded-md font-medium flex items-center justify-center text-sm            outline-none [&:not(:hover)]:focus-visible:ring-2 [&:not(:hover)]:focus-visible:ring-ring/40",
                variantMap[variant],
                sizeMap[size],
                className,
            )}
        >
            {children}
        </Tag>
    )
}
