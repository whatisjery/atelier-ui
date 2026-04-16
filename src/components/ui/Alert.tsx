"use client"

import { cn } from "@/lib/utils"

export type AlertVariant = keyof typeof variantMap

type AlertProps = {
    icon?: React.ReactNode
    title: string
    children: React.ReactNode
    variant: AlertVariant
    className?: string
}

const variantMap = {
    warning: "bg-mat-5/50 text-mat-1 border",
    error: "bg-red-500/10 text-red-500 border",
}

export default function Alert({ icon, title, variant, children, className }: AlertProps) {
    return (
        <div className={cn("rounded-xl gap-2 p-5", variantMap[variant], className)}>
            <span className="flex mb-2 items-center gap-2 text-xl font-medium">
                {icon}
                <h2 className="not-prose font-medium text-xl">{title}</h2>
            </span>

            <div className="not-prose">{children}</div>
        </div>
    )
}
