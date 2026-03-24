"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { DocNavigation } from "@/types/docs"

type DocPaginationProps = { navigation: DocNavigation }

const LINKS = [
    { key: "prev", icon: ArrowLeft, position: "left" },
    { key: "next", icon: ArrowRight, position: "right" },
] as const

export default function DocPagination({ navigation }: DocPaginationProps) {
    return (
        <nav className="not-prose border-t flex justify-between mb-10 gap-5 pt-10">
            {LINKS.map(({ key, icon: Icon, position }) => {
                const item = navigation[key]
                if (!item) return null

                return (
                    <Link
                        key={key}
                        className="text-sm flex items-center gap-2 font-medium hover:text-mat-2"
                        href={item.url}
                    >
                        {position === "left" && <Icon className="size-4" />}
                        {item.title}
                        {position === "right" && <Icon className="size-4" />}
                    </Link>
                )
            })}
        </nav>
    )
}
