import type React from "react"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { DocMeta } from "@/types/docs"

type DocHeaderGroupTitleProps = {
    meta: DocMeta
    headerSlot?: React.ReactNode
    showBreadcrumb?: boolean
    className?: string
    showMetaTags?: boolean
}

export default function DocHeaderGroupTitle({
    meta,
    headerSlot,
    showBreadcrumb = true,
    showMetaTags = false,
    className,
}: DocHeaderGroupTitleProps) {
    return (
        <header
            className={cn("not-prose items-start flex flex-col w-full overflow-x-auto", className)}
        >
            {showBreadcrumb ? (
                <div className="flex flex-col lg:flex-row items-start justify-between lg:items-center w-full mb-7">
                    <RouteBreadCrumb />
                    {headerSlot}
                </div>
            ) : (
                headerSlot
            )}

            <h1 className="font-bold text-4xl tracking-[-0.025em] mb-3">{meta.title}</h1>

            <p className="text-lg text-mat-2">{meta.description}</p>

            {showMetaTags && (
                <div className="flex flex-wrap gap-1 mt-3 mb-4">
                    {meta.tags?.map((tag) => (
                        <Badge key={tag} title={tag} variant="neutral" />
                    ))}
                </div>
            )}
        </header>
    )
}
