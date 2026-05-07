"use client"

import { cn } from "@/lib/utils"
import Card from "./Card"

export type AlertVariant = keyof typeof variantMap

type AlertProps = {
    icon?: React.ReactNode
    title: string
    children: React.ReactNode
    variant: AlertVariant
    className?: string
}

const variantMap = {
    neutral: "bg-bg border-dashed text-accent-1 border",
    error: "bg-red-400/10 text-red-500 border border-red-200",
}

export default function Alert({
    icon,
    title,
    variant = "neutral",
    children,
    className,
}: AlertProps) {
    return (
        <Card
            className={cn(
                "flex max-xs:flex-col relative items-start gap-2 p-5 pb-7",
                variantMap[variant],
                className,
            )}
        >
            {icon && <div className="mr-2 mt-0.5">{icon}</div>}
            <div className="not-prose">
                <h2 className="font-medium text-xl mb-1">{title}</h2>
                {children}
            </div>
        </Card>
    )
}
