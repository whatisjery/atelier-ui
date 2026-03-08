import type React from "react"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import { cn } from "@/lib/utils"
import type { DocMeta } from "@/types/docs"

type DocHeaderGroupTitleProps = {
    meta: DocMeta
    headerSlot?: React.ReactNode
    showBreadcrumb?: boolean
    className?: string
}

export default function DocHeaderGroupTitle({
    meta,
    headerSlot,
    showBreadcrumb = true,
    className,
}: DocHeaderGroupTitleProps) {
    return (
        <header
            className={cn("not-prose items-start flex flex-col w-full overflow-x-auto", className)}
        >
            {showBreadcrumb ? (
                <div className="flex justify-between items-center w-full mb-10">
                    <RouteBreadCrumb className="lg:block hidden" />
                    {headerSlot}
                </div>
            ) : (
                headerSlot
            )}

            <h1 className="font-bold text-4xl tracking-[-0.025em] mb-3">{meta.title}</h1>
            <p className="text-lg text-mat-2">{meta.description}</p>
        </header>
    )
}
