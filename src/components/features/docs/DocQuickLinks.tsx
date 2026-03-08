"use client"

import CardGrid from "@/components/ui/CardGrid"
import DashedBorder from "@/components/ui/DashedBorder"
import { cn, getLucideIcon } from "@/lib/utils"
import type { QuickLink } from "@/types/docs"

type DocQuickLinksProps = {
    links: QuickLink[]
}

export default function DocQuickLinks({ links }: DocQuickLinksProps) {
    return (
        <div className="relative grid grid-cols-1 md:grid-cols-2 mt-15">
            {links.map((link, index) => {
                const isLastItem = index === links.length - 1
                const isLastRow = index >= links.length - 2
                const isLeft = index % 2 === 0
                const Icon = getLucideIcon(link.icon)
                return (
                    <div key={link.title} className="relative">
                        {!isLastItem && (
                            <DashedBorder
                                direction="horizontal"
                                className={cn("absolute bottom-0 left-0", {
                                    "md:hidden": isLastRow,
                                    "right-0 md:right-px": isLeft,
                                    "right-0": !isLeft,
                                })}
                            />
                        )}
                        {isLeft && (
                            <DashedBorder
                                direction="vertical"
                                className="absolute top-0 right-0 bottom-px hidden md:block"
                            />
                        )}
                        <CardGrid
                            tags={link.tags}
                            iconSlot={<Icon strokeWidth={0.8} size={40} />}
                            href={link.href}
                            title={link.title}
                        />
                    </div>
                )
            })}
        </div>
    )
}
