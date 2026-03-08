"use client"

import { cn } from "@/lib/utils"

type SkeletonProps = {
    className?: string
    children?: React.ReactNode
}

export default function Skeleton({ className, children }: SkeletonProps) {
    return (
        <div data-slot="skeleton" className={cn("bg-mat-4/80 animate-pulse rounded-md", className)}>
            {children}
        </div>
    )
}
