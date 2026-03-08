"use client"

import React from "react"
import { IconGSAPIcon } from "@/components/icons/IconGSAP"
import { IconMotionIcon } from "@/components/icons/IconMotionIcon"
import { IconReactIcon } from "@/components/icons/IconReactIcon"
import { IconTailwindIcon } from "@/components/icons/IconTailwindIcon"
import { IconThreeJsIcon } from "@/components/icons/IconThreeJsIcon"
import { IconTypeScriptIcon } from "@/components/icons/IconTypeScriptIcon"
import { cn } from "@/lib/utils"

export const TECH_ICONS = [
    {
        icon: <IconMotionIcon size={30} />,
        title: "Motion",
    },
    {
        icon: <IconReactIcon size={30} />,
        title: "React",
    },
    {
        icon: <IconThreeJsIcon size={30} />,
        title: "Three.js",
    },
    {
        icon: <IconTailwindIcon size={30} />,
        title: "Tailwind",
    },
    {
        icon: <IconTypeScriptIcon size={22} />,
        title: "TypeScript",
    },
    {
        icon: <IconGSAPIcon size={38} />,
        title: "GreenSock",
    },
] as const

type ScrollableTechStackProps = {
    className?: string
} & React.ComponentProps<"div">

export default function ScrollableTechStack({ className }: ScrollableTechStackProps) {
    return (
        <div className={cn("relative h-full w-full overflow-hidden cursor-default", className)}>
            <ul className="flex gap-x-10 a-scroll-x list-none w-max h-full">
                {[...Array(3)].map((_, index, array) => (
                    <React.Fragment key={index}>
                        {TECH_ICONS.map(({ icon, title }) => (
                            <li
                                key={title}
                                title={title}
                                className="flex items-center justify-center gap-2 shrink-0 text-mat-2/60"
                                aria-hidden={index > array.length ? "true" : undefined}
                            >
                                <span>{icon}</span>
                                <span className="text-lg whitespace-nowrap">{title}</span>
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
        </div>
    )
}
