"use client"

import React from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

function formatSegment(seg: string): string {
    return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

type RouteBreadCrumbProps = {
    className?: string
    skip?: string[]
}

export default function RouteBreadCrumb({ className, skip = [] }: RouteBreadCrumbProps) {
    const pathname = usePathname()
    const segments = pathname
        .split("/")
        .filter(Boolean)
        .filter((segment) => !skip.includes(segment))

    const breadcrumbs = segments.map((seg, i) => ({
        href: `/${segments.slice(0, i + 1).join("/")}`,
        label: formatSegment(seg),
        isLast: i === segments.length - 1,
        isFirst: i === 0,
    }))

    return (
        <nav
            aria-label="breadcrumb"
            className={cn("max-xs:hidden max-w-full overflow-x-auto scrollbar-overlay", className)}
        >
            <ol className="text-accent-2 text-sm py-2 flex items-center gap-1.5 whitespace-nowrap">
                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                        {item.isFirst ? null : (
                            <li role="presentation" aria-hidden="true">
                                /
                            </li>
                        )}

                        <li className="inline-flex items-center gap-1.5 list-none">
                            {item.isLast ? (
                                <span aria-current="page" className="text-accent-1 font-medium">
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href}>{item.label}</Link>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    )
}
