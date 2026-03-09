"use client"

import { ChevronRight } from "lucide-react"
import React from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const LABEL_OVERRIDES: Record<string, string> = {}

function formatSegment(seg: string): string {
    if (LABEL_OVERRIDES[seg]) return LABEL_OVERRIDES[seg]
    return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

type RouteBreadCrumbProps = {
    className?: string
}

export default function RouteBreadCrumb({ className }: RouteBreadCrumbProps) {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    const breadcrumbs = segments.map((seg, i) => ({
        href: `/${segments.slice(0, i + 1).join("/")}`,
        label: formatSegment(seg),
        isLast: i === segments.length - 1,
        isFirst: i === 0,
    }))

    return (
        <nav aria-label="breadcrumb" className={cn("overflow-x-auto max-w-full", className)}>
            <ol className="text-mat-2 scrollbar-overlay max-xs:py-2 flex items-center gap-1.5 text-sm sm:gap-2.5 whitespace-nowrap">
                {breadcrumbs.map(({ href, label, isLast, isFirst }) => (
                    <React.Fragment key={href}>
                        {isFirst ? null : (
                            <li role="presentation" aria-hidden="true">
                                <ChevronRight className="size-3.5" />
                            </li>
                        )}

                        <li className="inline-flex items-center gap-1.5 list-none">
                            {isLast ? (
                                <span aria-current="page" className="text-highlight font-medium">
                                    {label}
                                </span>
                            ) : isFirst ? (
                                <Link href={href}>Docs</Link>
                            ) : (
                                <span>{label}</span>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    )
}
