"use client"

import { useTranslations } from "next-intl"
import Badge from "@/components/ui/Badge"
import { Link, usePathname } from "@/i18n/navigation"
import { TEMP_NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function DocTopNavTempNav() {
    const pathname = usePathname()
    const t = useTranslations("docs.links")
    const tCommon = useTranslations("common")

    return (
        <>
            {TEMP_NAV_LINKS.map(({ key, href, wip }) => {
                const isActive = pathname.includes(href)

                return (
                    <Link
                        key={key}
                        className={cn(
                            "relative h-full items-center lg:flex hidden",
                            "after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-full after:bg-highlight",
                            {
                                "text-mat-1 font-semibold after:scale-x-100": isActive,
                                "text-mat-2 font-medium after:scale-x-0": !isActive,
                                "cursor-not-allowed": wip,
                            },
                        )}
                        href={href}
                    >
                        {t(key)}

                        {wip && <Badge title={tCommon("wip")} className="ml-3" variant="wip" />}
                    </Link>
                )
            })}
        </>
    )
}
