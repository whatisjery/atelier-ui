"use client"

import { IconMotionIcon } from "@/components/icons/IconMotionIcon"
import { IconReactIcon } from "@/components/icons/IconReactIcon"
import { IconTailwindIcon } from "@/components/icons/IconTailwindIcon"
import { IconThreeJsIcon } from "@/components/icons/IconThreeJsIcon"
import { IconTypeScriptIcon } from "@/components/icons/IconTypeScriptIcon"
import ScrollingMarquee from "@/components/ui/ScrollingMarquee"

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
        title: "React Three Fiber",
    },
    {
        icon: <IconTailwindIcon size={30} />,
        title: "Tailwind",
    },
    {
        icon: <IconTypeScriptIcon size={22} />,
        title: "TypeScript",
    },
] as const

type ScrollableTechStackProps = {
    className?: string
    fadeOnEachSide?: boolean
}

export default function ScrollableTechStack({
    className,
    fadeOnEachSide = false,
}: ScrollableTechStackProps) {
    return (
        <ScrollingMarquee className={className} fadeOnEachSide={fadeOnEachSide}>
            {TECH_ICONS.map(({ icon, title }) => (
                <div
                    key={title}
                    title={title}
                    className="flex items-center justify-center gap-2 shrink-0 text-mat-2/60 mr-10"
                >
                    <span>{icon}</span>
                    <span className="text-lg whitespace-nowrap">{title}</span>
                </div>
            ))}
        </ScrollingMarquee>
    )
}
