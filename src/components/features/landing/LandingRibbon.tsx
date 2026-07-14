import { ArrowRight } from "lucide-react"
import React from "react"
import Badge from "@/components/ui/Badge"
import ScrollingMarquee from "@/components/ui/ScrollingMarquee"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type RibbonItem = {
    title: string
    url: string
}

type LandingRibbonProps = {
    className?: string
    items: RibbonItem[]
}

export default function LandingRibbon({ className, items }: LandingRibbonProps) {
    if (items.length === 0) return null

    return (
        <div
            className={cn(
                "w-full py-2.5 pt-3 pattern-line relative border-b text-[0.7rem] uppercase tracking-widest",
                className,
            )}
        >
            <ScrollingMarquee speed={items.length * 70} itemCount={6}>
                <span className="flex items-center gap-x-6 pr-6 whitespace-nowrap">
                    {items.map((item) => (
                        <React.Fragment key={item.url}>
                            <span className="flex items-center gap-x-2">
                                <Badge title="new" variant="neutral" aria-hidden="true" />
                                <Link href={item.url} tabIndex={-1} className="hover:underline">
                                    {item.title}
                                </Link>
                            </span>
                            <ArrowRight className="size-3" />
                        </React.Fragment>
                    ))}
                </span>
            </ScrollingMarquee>
        </div>
    )
}
