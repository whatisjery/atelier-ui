import React from "react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { DocComponentStatus } from "@/types/docs"
import Badge, { type BadgeVariant } from "./Badge"
import BouncingText from "./BouncingText"
import GridPattern from "./GridPattern"

type CardGridIconProps = {
    title: string
    href: string
    className?: string
    iconSlot?: React.ReactNode
    focusable?: boolean
    tags?: string[]
    badge?: DocComponentStatus
}

type BadgeConfig = {
    title: string
    variant: BadgeVariant
    muted?: boolean
}

const BADGE_CONFIG: Record<DocComponentStatus, BadgeConfig> = {
    wip: { title: "WIP", variant: "update", muted: true },
    new: { title: "New", variant: "new" },
    update: { title: "Updated recently", variant: "update" },
}

export default function CardGrid({
    href,
    title,
    iconSlot,
    tags,
    className,
    focusable = true,
    badge,
}: CardGridIconProps) {
    return (
        <Link
            tabIndex={focusable ? undefined : -1}
            href={href}
            className="block no-underline relative not-prose group cursor-pointer group"
        >
            <GridPattern />

            <div
                className={cn(
                    "relative pointer-events-none flex z-2 items-center flex-col py-5 justify-center aspect-square gap-y-3 transition-colors duration-300",
                    className,
                )}
            >
                {title && (
                    <div className="flex pointer-events-none flex-col items-center mb-12 gap-y-1">
                        <div className="flex flex-col relative items-center gap-y-1">
                            {iconSlot && (
                                <div className="flex items-center gap-x-2">{iconSlot}</div>
                            )}

                            {badge && (
                                <Badge
                                    title={BADGE_CONFIG[badge].title}
                                    variant={BADGE_CONFIG[badge].variant}
                                    className={cn("absolute top-[6rem]", {
                                        "opacity-50": BADGE_CONFIG[badge].muted,
                                    })}
                                />
                            )}
                        </div>

                        <h4 className="group-hover:underline underline-offset-2 decoration-1 font-serif whitespace-nowrap text-4xl flex items-center">
                            {title}
                        </h4>
                    </div>
                )}

                {tags && tags.length > 0 && (
                    <BouncingText maxWidth={70} className="absolute bottom-5">
                        <div className="flex text-xs">
                            {tags.map((tag, index) => (
                                <React.Fragment key={index}>
                                    <div className="uppercase">{tag}</div>
                                    {index < tags.length - 1 && (
                                        <span className="px-1 font-sans">&nbsp;&bull;&nbsp;</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </BouncingText>
                )}
            </div>
        </Link>
    )
}
