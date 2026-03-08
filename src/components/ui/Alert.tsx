"use client"

import { cn } from "@/lib/utils"

export type AlertVariant = keyof typeof variantMap

type AlertProps = {
    icon: React.ReactNode
    title: string
    children: React.ReactNode
    variant: AlertVariant
}

const variantMap = {
    warning: "bg-accent-neutral/4 text-accent-neutral border border-accent-neutral/12",
}

export default function Alert({ icon, title, variant, children }: AlertProps) {
    return (
        <div className={cn("rounded-xl gap-2 p-5", variantMap[variant])}>
            <span className="flex mb-2 items-center gap-2 text-xl font-medium">
                {icon}
                <h2 className="not-prose font-medium text-xl">{title}</h2>
            </span>

            <div className="not-prose">{children}</div>
        </div>
    )
}
