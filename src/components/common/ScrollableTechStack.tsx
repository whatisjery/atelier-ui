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
    fadeOnEachSide?: boolean
} & React.ComponentProps<"div">

export default function ScrollableTechStack({
    className,
    fadeOnEachSide = false,
}: ScrollableTechStackProps) {
    return (
        <div className={cn("relative h-full w-full overflow-hidden cursor-default", className)}>
            {fadeOnEachSide && (
                <>
                    <span className="absolute left-0 top-0 w-[20%] h-full z-2 bg-gradient-to-l from-transparent to-background" />
                    <span className="absolute right-0 top-0 w-[20%] h-full z-2 bg-gradient-to-r from-transparent to-background" />
                </>
            )}
            <ul className="flex a-scroll-x list-none w-max h-full relative">
                {[...Array(3)].map((_, index, array) => (
                    <React.Fragment key={index}>
                        {TECH_ICONS.map(({ icon, title }) => (
                            <li
                                key={title}
                                title={title}
                                className="flex items-center justify-center gap-2 shrink-0 text-mat-2/60 mr-10"
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
