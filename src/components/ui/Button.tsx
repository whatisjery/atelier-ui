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
    solid: "bg-mat-5",
    muted: "bg-transparent text-mat-2 hover:text-mat-1",
    ghost: "bg-transparent hover:bg-mat-5",
    outline: "border hover:text-mat-1 hover:bg-mat-5",
} as const

const sizeMap = {
    icon: "h-9 aspect-square",
    rect: "h-9 px-4 gap-2",
} as const

export default function Button({
    children,
    className,
    variant = "solid",
    asChild = false,
    size = "rect",
    ...props
}: ButtonProps) {
    const Tag = asChild ? Slot.Root : "button"

    return (
        <Tag
            {...props}
            className={cn(
                "cursor-pointer rounded-md font-medium flex items-center justify-center",
                variantMap[variant],
                sizeMap[size],
                className,
            )}
        >
            {children}
        </Tag>
    )
}
