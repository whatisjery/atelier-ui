import { useTranslations } from "next-intl"
import React from "react"
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
    const tCommon = useTranslations("common")

    return (
        <div
            className={cn(
                "w-full h-ribbon-h relative z-10 bg-accent-1 dark:text-accent-5 dark:bg-accent-1 text-white border-b text-[0.7rem] uppercase tracking-widest",
                className,
            )}
        >
            <ScrollingMarquee speed={items.length * 70} itemCount={6}>
                <span className="flex items-center gap-x-6 pr-6 whitespace-nowrap">
                    {items.map((item) => (
                        <React.Fragment key={item.url}>
                            <span className="flex items-center">
                                <span className="flex items-center before:content-['('] after:content-[')'] mr-2">
                                    {tCommon("new")}
                                </span>
                                <Link href={item.url} tabIndex={-1} className="hover:underline">
                                    {item.title}
                                </Link>
                            </span>
                            <span className="opacity-50 text-[0.85rem] -mb-1 font-medium font-mono">
                                ***
                            </span>
                        </React.Fragment>
                    ))}
                </span>
            </ScrollingMarquee>
        </div>
    )
}
